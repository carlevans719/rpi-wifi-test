import { Meteor } from 'meteor/meteor'

Meteor.method = function (name, func) {
  return Meteor.methods({
    [name]: func
  })
}
