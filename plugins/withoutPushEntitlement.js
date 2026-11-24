// Removes the Push Notifications entitlement that expo-notifications adds on iOS.
// Rasoi only schedules local notifications on the phone, which need no entitlement,
// and a free Apple "Personal Team" cannot sign apps that ask for push.
const { withEntitlementsPlist } = require('expo/config-plugins');

module.exports = function withoutPushEntitlement(config) {
  return withEntitlementsPlist(config, (cfg) => {
    delete cfg.modResults['aps-environment'];
    return cfg;
  });
};
