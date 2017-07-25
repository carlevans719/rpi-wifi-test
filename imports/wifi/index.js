import Future from 'fibers/future'
import { Meteor } from 'meteor/meteor'
import wifi from 'pi-wifi'

let defaultInterface = 'wlan0'
wifi.listInterfaces(function (err, interfaces) {
  console.log(err, interfaces)
  if (!err && interfaces.length) {
    defaultInterface = interfaces[0]

    wifi.setCurrentInterface(defaultInterface, function (error) {
      if (error) {
        console.error(error)
      }

      wifi.killSupplicant(defaultInterface, function (e) {
        if (e) {
          console.error(e)
        }

        wifi.detectSupplicant(function () {
          console.log(arguments)

          wifi.startSupplicant({iface: defaultInterface}, function (error1) {
            if (error1) {
              console.error(error1)
            }
          })
        })
      })
    })
  }
})


/**
 * wifi.interfaces.available
 * 
 * @summary returns an array of wifi interfaces available for configuration
 */
Meteor.method('wifi.interfaces.available', function () {
  const future = new Future()

  wifi.listInterfaces(function (err, interfaces) {
    if (err) {
      console.error(err)      
      return future.throw(new Meteor.Error(err.message))
    }
    
    future.return(interfaces)
  })

  this.unblock()
  return future.wait()
})

/**
 * wifi.interfaces.use
 * 
 * @summary sets the supplied interface as the default
 * @param {string} interface - the interface to use
 */
Meteor.method('wifi.interfaces.use', function (iface) {
  const future = new Future()

  wifi.setCurrentinterface(function (err) {
    if (err) {
      console.error(err)
      return future.throw(new Meteor.Error(err.message))
    }
    
    defaultInterface = iface
    future.return(true)
  })

  return future.wait()
})

/**
 * wifi.status
 * 
 * @summary returns the status of the currently active interface
 */
Meteor.method('wifi.status', function (iface = defaultInterface) {
  const future = new Future()

  wifi.status(iface, function (err, status) {
    if (err) {
      console.error(err)
      return future.throw(new Meteor.Error(err.message))
    }
    
    future.return(status)
  })

  this.unblock()
  return future.wait()
})

/**
 * wifi.networks.available
 *
 * @summary returns a list of available wifi networks, sorted by signal strength
 */
Meteor.method('wifi.networks.available', function () {
  const future = new Future()

  wifi.scan((err, networks) => {
    if (err) {
      console.error(err)
      return future.throw(new Meteor.Error(err.message))
    }

    future.return(networks)
  })

  this.unblock()
  return future.wait()
})

/**
 * wifi.networks.connect
 * 
 * @summary Connect to a wifi network with a given ssid & password
 * @param {string} ssid - the ssid of the network to connect to
 * @param {string} password - the password for the network
 */
Meteor.method('wifi.networks.connect', function ({ssid, password}) {
  function callback (err) {
    if (err) {
      console.error(err)
      return future.throw(new Meteor.Error(err.message))
    }

    future.return(true)
  }

  if (!ssid) {
    throw new Meteor.Error('Must provide a ssid')
  }

  const future = new Future()

  if (password) {
    wifi.connectTo({ssid, password}, callback)
  } else {
    wifi.connectOpen(ssid, callback)
  }
  
  this.unblock()
  return future.wait()
})

/**
 * wifi.networks.disconnect
 * 
 * @summary disconnects from the currently connected wifi network
 */
Meteor.method('wifi.networks.disconnect', function () {
  const future = new Future()

  wifi.disconnect(function (err) {
    if (err) {
      console.error(err)
      return future.throw(new Meteor.Error(err.message))
    }

    future.return(true)
  })
  
  this.unblock()
  return future.wait()
})
