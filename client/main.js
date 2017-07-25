import { Meteor } from 'meteor/meteor'
import { Template } from 'meteor/templating'
import { ReactiveVar } from 'meteor/reactive-var'
import toastr from 'toastr'

import './main.html'

Template.networks.onCreated(function () {
  this.networks = new ReactiveVar([])
  this.currentNetwork = new ReactiveVar('')

  this.scan = () => {
    Meteor.call('wifi.networks.available', (err, networks) => {
      if (err) {
        this.networks.set([])
        console.error(err)
        return toastr.error(err.message)
      }

      this.networks.set(networks)
    })
  }

  this.getCurrentNetwork = () => {
    Meteor.call('wifi.status', (err, status) => {
      if (err) {
        this.currentNetwork.set('')
        console.error(err)
        return toastr.error(err.message)
      }

      this.currentNetwork.set(status.ssid)
    })
  }

  this.collapseRows = () => {
    this.$('.togglable-row.visible-row input[type="password"]').val('')
    this.$('.togglable-row.visible-row').removeClass('visible-row')
  }

  this.timer = setInterval(() => {
    this.scan()
    this.getCurrentNetwork()
  }, 5000)
})

Template.networks.onDestroyed(function () {
  clearInterval(this.timer)
  this.timer = null
})

Template.networks.helpers({
  networks () {
    return Template.instance().networks.get()
  },
  collapseRows () {
    return Template.instance().collapseRows
  },
  currentNetwork () {
    return Template.instance().currentNetwork.get()
  }
})

Template.networkRow.helpers({
  getPercentage (strength) {
    return 100 + parseInt(strength, 10)
  },
  isProtected (flags) {
    flags = (flags || '').toLowerCase()

    if (flags.indexOf('wpa2') !== -1) {
      return 'wpa2'
    } else if (flags.indexOf('wpa') !== -1) {
      return 'wpa'
    } else if (flags.indexOf('wep') !== -1) {
      return 'wep'
    }
  }
})

Template.networkRow.events({
  'click .js-network-row' (e, t) {
    const toggleRow = t.$('.togglable-row')[0]
    if (toggleRow) {
      Template.currentData().collapseRows()
      t.$(toggleRow).addClass('visible-row')
    }
  },
  'click .js-connect-button' (e, t) {
    function callback (err, res) {
      console.log(err, res)
    }

    const ssid = this.network.ssid
    const passwordField = t.$('input[type="password"]')[0]
    if (passwordField) {
      Meteor.call('wifi.networks.connect', {ssid, password: passwordField.value}, callback)
    } else {
      Meteor.call('wifi.networks.connect', {ssid}, callback)
    }
  }
})