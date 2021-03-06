(function(angular) {
  'use strict';

  angular.module('linagora.esn.james')

  .factory('jamesApiClient', jamesApiClient);

  function jamesApiClient(jamesRestangular) {
    return {
      generateJwtToken: generateJwtToken,
      getDomainsSyncStatus: getDomainsSyncStatus,
      getGroupSyncStatus: getGroupSyncStatus,
      syncGroup: syncGroup,
      syncDomains: syncDomains
    };

    /**
     * Generate JWT to authenticate against James Webadmin APIs
     * @param  {String} domainId - (optional) The domain ID if the logged in user
     *                             is domain aministrator. Omit this if the logged
     *                             in user is platform administrator.
     * @return {Promise}          - On success, resolves with the response containing the token
     */
    function generateJwtToken(domainId) {
      return jamesRestangular.one('token').post(null, null, { domain_id: domainId });
    }

    /**
     * Get synchronization status of a group
     * @param  {String} groupId - The group ID
     * @return {Promise}         - On success, resolves with the response containing the status
     */
    function getGroupSyncStatus(groupId) {
      return jamesRestangular.one('sync').one('groups', groupId).get();
    }

    /**
     * Re-synchronize a group
     * @param  {String} groupId - The group ID
     * @return {Promise}        - Resolve empty response on success
     */
    function syncGroup(groupId) {
      return jamesRestangular.one('sync').one('groups', groupId).post();
    }

    /**
     * Get synchronization status of domains
     * @return {Promise}        - Resolve empty response on success
     */
    function getDomainsSyncStatus() {
      return jamesRestangular.one('sync').one('domains').get();
    }

    /**
     * Re-synchronize domains
     * @return {Promise}        - Resolve empty response on success
     */
    function syncDomains() {
      return jamesRestangular.one('sync').one('domains').post();
    }
  }
})(angular);
