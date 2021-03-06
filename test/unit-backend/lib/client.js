const sinon = require('sinon');
const { expect } = require('chai');
const q = require('q');
const mockery = require('mockery');

describe('The lib/client module', function() {
  let getModule;
  let tokenMock, esnConfigGetMock, JamesClientMock;

  beforeEach(function() {
    getModule = () => require(this.moduleHelpers.backendPath + '/lib/client')(this.moduleHelpers.dependencies);

    tokenMock = { generate: () => q.resolve() };
    esnConfigGetMock = () => q.resolve();
    JamesClientMock = function() {};

    mockery.registerMock('./token', () => tokenMock);
    mockery.registerMock('@linagora/james-admin-client', { Client: JamesClientMock });
    this.moduleHelpers.addDep('esn-config', () => ({
      inModule() {
        return { get: esnConfigGetMock };
      }
    }));
  });

  describe('The addGroupMembers function', function() {
    it('should fail if it cannot get API URL', function(done) {
      const group = 'group@email.com';
      const members = ['member1@email.com', 'member2@email.com'];

      esnConfigGetMock = () => q.reject(new Error('an_error'));

      getModule().addGroupMembers(group, members).catch(err => {
        expect(err.message).to.equal('an_error');
        done();
      });
    });

    it('should fail if it cannot generate JWT token', function(done) {
      const group = 'group@email.com';
      const members = ['member1@email.com', 'member2@email.com'];

      tokenMock.generate = () => q.reject(new Error('an_error'));

      getModule().addGroupMembers(group, members).catch(err => {
        expect(err.message).to.equal('an_error');
        done();
      });
    });

    it('should add all group members one by one', function(done) {
      const group = 'group@email.com';
      const members = ['member1@email.com', 'member2@email.com'];

      JamesClientMock.prototype.addGroupMember = sinon.stub().returns(q.resolve());

      getModule().addGroupMembers(group, members).then(() => {
        expect(JamesClientMock.prototype.addGroupMember).to.have.been.calledTwice;
        expect(JamesClientMock.prototype.addGroupMember).to.have.been.calledWith(group, members[0]);
        expect(JamesClientMock.prototype.addGroupMember).to.have.been.calledWith(group, members[1]);
        done();
      });
    });
  });

  describe('The getGroupMembers function', function() {
    it('should fail if it cannot get API URL', function(done) {
      const group = 'group@email.com';

      esnConfigGetMock = () => q.reject(new Error('an_error'));

      getModule().getGroupMembers(group).catch(err => {
        expect(err.message).to.equal('an_error');
        done();
      });
    });

    it('should fail if it cannot generate JWT token', function(done) {
      const group = 'group@email.com';

      tokenMock.generate = () => q.reject(new Error('an_error'));

      getModule().getGroupMembers(group).catch(err => {
        expect(err.message).to.equal('an_error');
        done();
      });
    });

    it('should resolve empty array on client error', function(done) {
      const group = 'group@email.com';

      JamesClientMock.prototype.listGroupMembers = sinon.stub().returns(q.reject(new Error('an_error')));

      getModule().getGroupMembers(group).then((members) => {
        expect(JamesClientMock.prototype.listGroupMembers).to.have.been.calledOnce;
        expect(JamesClientMock.prototype.listGroupMembers).to.have.been.calledWith(group);
        expect(members).to.have.length(0);
        done();
      });
    });

    it('should resolve array of members on success', function(done) {
      const group = 'group@email.com';
      const members = ['member1@email.com', 'member2@email.com'];

      JamesClientMock.prototype.listGroupMembers = sinon.stub().returns(q.resolve(members));

      getModule().getGroupMembers(group).then((members) => {
        expect(JamesClientMock.prototype.listGroupMembers).to.have.been.calledOnce;
        expect(JamesClientMock.prototype.listGroupMembers).to.have.been.calledWith(group);
        expect(members).to.have.length(2);
        done();
      });
    });
  });

  describe('The removeGroup function', function() {
    it('should fail if it cannot get API URL', function(done) {
      const group = 'group@email.com';

      esnConfigGetMock = () => q.reject(new Error('an_error'));

      getModule().removeGroup(group).catch(err => {
        expect(err.message).to.equal('an_error');
        done();
      });
    });

    it('should fail if it cannot generate JWT token', function(done) {
      const group = 'group@email.com';

      tokenMock.generate = () => q.reject(new Error('an_error'));

      getModule().removeGroup(group).catch(err => {
        expect(err.message).to.equal('an_error');
        done();
      });
    });

    it('should list all members and remove them all', function(done) {
      const group = 'group@email.com';
      const members = ['member1@email.com', 'member2@email.com'];

      JamesClientMock.prototype.listGroupMembers = sinon.stub().returns(q.resolve(members));
      JamesClientMock.prototype.removeGroupMember = sinon.stub().returns(q.resolve());

      getModule().removeGroup(group).then(() => {
        expect(JamesClientMock.prototype.listGroupMembers).to.have.been.calledOnce;
        expect(JamesClientMock.prototype.listGroupMembers).to.have.been.calledWith(group);

        expect(JamesClientMock.prototype.removeGroupMember).to.have.been.calledTwice;
        expect(JamesClientMock.prototype.removeGroupMember).to.have.been.calledWith(group, members[0]);
        expect(JamesClientMock.prototype.removeGroupMember).to.have.been.calledWith(group, members[1]);
        done();
      });
    });
  });

  describe('The removeGroupMembers function', function() {
    it('should fail if it cannot get API URL', function(done) {
      const group = 'group@email.com';
      const members = ['member1@email.com', 'member2@email.com'];

      esnConfigGetMock = () => q.reject(new Error('an_error'));

      getModule().removeGroupMembers(group, members).catch(err => {
        expect(err.message).to.equal('an_error');
        done();
      });
    });

    it('should fail if it cannot generate JWT token', function(done) {
      const group = 'group@email.com';
      const members = ['member1@email.com', 'member2@email.com'];

      tokenMock.generate = () => q.reject(new Error('an_error'));

      getModule().removeGroupMembers(group, members).catch(err => {
        expect(err.message).to.equal('an_error');
        done();
      });
    });

    it('should remove group members one by one', function(done) {
      const group = 'group@email.com';
      const members = ['member1@email.com', 'member2@email.com'];

      JamesClientMock.prototype.removeGroupMember = sinon.stub().returns(q.resolve());

      getModule().removeGroupMembers(group, members).then(() => {
        expect(JamesClientMock.prototype.removeGroupMember).to.have.been.calledTwice;
        expect(JamesClientMock.prototype.removeGroupMember).to.have.been.calledWith(group, members[0]);
        expect(JamesClientMock.prototype.removeGroupMember).to.have.been.calledWith(group, members[1]);
        done();
      });
    });
  });

  describe('The updateGroup function', function() {
    it('should fail if old and new group are the same', function(done) {
      const oldGroup = 'old@group.com';
      const newGroup = 'old@group.com';

      getModule().updateGroup(oldGroup, newGroup).catch(err => {
        expect(err.message).to.equal('nothing to update');
        done();
      });
    });

    it('should fail if it cannot get API URL', function(done) {
      const oldGroup = 'old@group.com';
      const newGroup = 'new@group.com';

      esnConfigGetMock = () => q.reject(new Error('an_error'));

      getModule().updateGroup(oldGroup, newGroup).catch(err => {
        expect(err.message).to.equal('an_error');
        done();
      });
    });

    it('should fail if it cannot generate JWT token', function(done) {
      const oldGroup = 'old@group.com';
      const newGroup = 'new@group.com';

      tokenMock.generate = () => q.reject(new Error('an_error'));

      getModule().updateGroup(oldGroup, newGroup).catch(err => {
        expect(err.message).to.equal('an_error');
        done();
      });
    });

    it('should move all members from old group to the new one', function(done) {
      const oldGroup = 'old@group.com';
      const newGroup = 'new@group.com';
      const members = ['member1@email.com', 'member2@email.com'];

      JamesClientMock.prototype.listGroupMembers = sinon.stub().returns(q.resolve(members));
      JamesClientMock.prototype.addGroupMember = sinon.stub().returns(q.resolve());
      JamesClientMock.prototype.removeGroupMember = sinon.stub().returns(q.resolve());

      getModule().updateGroup(oldGroup, newGroup).then(() => {
        expect(JamesClientMock.prototype.removeGroupMember).to.have.been.calledTwice;
        expect(JamesClientMock.prototype.removeGroupMember).to.have.been.calledWith(oldGroup, members[0]);
        expect(JamesClientMock.prototype.removeGroupMember).to.have.been.calledWith(oldGroup, members[1]);

        expect(JamesClientMock.prototype.addGroupMember).to.have.been.calledTwice;
        expect(JamesClientMock.prototype.addGroupMember).to.have.been.calledWith(newGroup, members[0]);
        expect(JamesClientMock.prototype.addGroupMember).to.have.been.calledWith(newGroup, members[1]);
        done();
      });
    });
  });

  describe('The addDestinationsToForward function', function() {
    let forward, destinations;

    beforeEach(() => {
      forward = 'user0@email.com';
      destinations = ['user1@email.com', 'user2@email.com'];
    });

    it('should fail if it cannot get API URL', done => {
      esnConfigGetMock = () => q.reject(new Error('an_error'));

      getModule().addDestinationsToForward(forward, destinations).catch(err => {
        expect(err.message).to.equal('an_error');
        done();
      });
    });

    it('should fail if it cannot generate JWT token', done => {
      tokenMock.generate = () => q.reject(new Error('an_error'));

      getModule().addDestinationsToForward(forward, destinations).catch(err => {
        expect(err.message).to.equal('an_error');
        done();
      });
    });

    it('should add all destinations one by one', done => {
      JamesClientMock.prototype.forward = {
        addDestination: sinon.stub().returns(q.resolve())
      };

      getModule().addDestinationsToForward(forward, destinations).then(() => {
        expect(JamesClientMock.prototype.forward.addDestination).to.have.been.calledTwice;
        expect(JamesClientMock.prototype.forward.addDestination).to.have.been.calledWith(forward, destinations[0]);
        expect(JamesClientMock.prototype.forward.addDestination).to.have.been.calledWith(forward, destinations[1]);
        done();
      });
    });
  });

  describe('The removeDestinationsOfForward function', function() {
    let forward, destinations;

    beforeEach(() => {
      forward = 'user0@email.com';
      destinations = ['user1@email.com', 'user2@email.com'];
    });

    it('should fail if it cannot get API URL', function(done) {
      esnConfigGetMock = () => q.reject(new Error('an_error'));

      getModule().removeDestinationsOfForward(forward, destinations).catch(err => {
        expect(err.message).to.equal('an_error');
        done();
      });
    });

    it('should fail if it cannot generate JWT token', function(done) {
      tokenMock.generate = () => q.reject(new Error('an_error'));

      getModule().removeDestinationsOfForward(forward, destinations).catch(err => {
        expect(err.message).to.equal('an_error');
        done();
      });
    });

    it('should remove destinations one by one', function(done) {
      JamesClientMock.prototype.forward = {
        removeDestination: sinon.stub().returns(q.resolve())
      };

      getModule().removeDestinationsOfForward(forward, destinations).then(() => {
        expect(JamesClientMock.prototype.forward.removeDestination).to.have.been.calledTwice;
        expect(JamesClientMock.prototype.forward.removeDestination).to.have.been.calledWith(forward, destinations[0]);
        expect(JamesClientMock.prototype.forward.removeDestination).to.have.been.calledWith(forward, destinations[1]);
        done();
      });
    });
  });

  describe('The removeForward function', function() {
    const forward = 'user0@email.com';

    it('should fail if it cannot get API URL', function(done) {
      esnConfigGetMock = () => q.reject(new Error('an_error'));

      getModule().removeForward(forward).catch(err => {
        expect(err.message).to.equal('an_error');
        done();
      });
    });

    it('should fail if it cannot generate JWT token', function(done) {
      tokenMock.generate = () => q.reject(new Error('an_error'));

      getModule().removeForward(forward).catch(err => {
        expect(err.message).to.equal('an_error');
        done();
      });
    });

    it('should remove all destinations of forward', function(done) {
      const dest1 = 'user1@email.com';
      const dest2 = 'user2@email.com';
      const destinations = [
        { mailAddress: dest1 },
        { mailAddress: dest2 }
      ];

      JamesClientMock.prototype.forward = {
        listDestinationsOfForward: sinon.stub().returns(Promise.resolve(destinations)),
        removeDestination: sinon.stub().returns(Promise.resolve())
      };

      getModule().removeForward(forward).then(() => {
        expect(JamesClientMock.prototype.forward.listDestinationsOfForward).to.have.been.calledWith(forward);
        expect(JamesClientMock.prototype.forward.removeDestination).to.have.been.calledWith(forward, dest1);
        expect(JamesClientMock.prototype.forward.removeDestination).to.have.been.calledWith(forward, dest2);
        done();
      });
    });
  });

  describe('The removeLocalCopyOfForward function', function() {
    const forward = 'user0@email.com';

    it('should fail if it cannot get API URL', function(done) {
      esnConfigGetMock = () => q.reject(new Error('an_error'));

      getModule().removeLocalCopyOfForward(forward).catch(err => {
        expect(err.message).to.equal('an_error');
        done();
      });
    });

    it('should fail if it cannot generate JWT token', function(done) {
      tokenMock.generate = () => q.reject(new Error('an_error'));

      getModule().removeLocalCopyOfForward(forward).catch(err => {
        expect(err.message).to.equal('an_error');
        done();
      });
    });

    it('should remove local copy of forward', function(done) {
      JamesClientMock.prototype.forward = {
        removeDestination: sinon.stub().returns(Promise.resolve())
      };

      getModule().removeLocalCopyOfForward(forward).then(() => {
        expect(JamesClientMock.prototype.forward.removeDestination).to.have.been.calledWith(forward, forward);
        done();
      });
    });
  });

  describe('The listDestinationsOfForward function', function() {
    it('should fail if it cannot get API URL', function(done) {
      esnConfigGetMock = () => q.reject(new Error('an_error'));

      getModule().listDestinationsOfForward('user0@email.com').catch(err => {
        expect(err.message).to.equal('an_error');
        done();
      });
    });

    it('should fail if it cannot generate JWT token', function(done) {
      tokenMock.generate = () => q.reject(new Error('an_error'));

      getModule().listDestinationsOfForward('user0@email.com').catch(err => {
        expect(err.message).to.equal('an_error');
        done();
      });
    });

    it('should return an empty array if get 404 error from client', function(done) {
      const forward = 'user0@email.com';

      JamesClientMock.prototype.forward = {
        listDestinationsOfForward: sinon.stub().returns(q.reject({ response: { status: 404 } }))
      };

      getModule().listDestinationsOfForward(forward).then(destinations => {
        expect(JamesClientMock.prototype.forward.listDestinationsOfForward).to.have.been.calledOnce;
        expect(JamesClientMock.prototype.forward.listDestinationsOfForward).to.have.been.calledWith(forward);
        expect(destinations).to.have.lengthOf(0);
        done();
      });
    });

    it('should return an array of destinations if success', function(done) {
      const forward = 'user0@email.com';
      const dest1 = 'user1@email.com';
      const dest2 = 'user2@email.com';
      const destinations = [
        { mailAddress: dest1 },
        { mailAddress: dest2 }
      ];

      JamesClientMock.prototype.forward = {
        listDestinationsOfForward: sinon.stub().returns(q.resolve(destinations))
      };

      getModule().listDestinationsOfForward(forward).then(destinations => {
        expect(JamesClientMock.prototype.forward.listDestinationsOfForward).to.have.been.calledOnce;
        expect(JamesClientMock.prototype.forward.listDestinationsOfForward).to.have.been.calledWith(forward);
        expect(destinations).to.deep.equal([dest1, dest2]);
        done();
      });
    });
  });

  describe('The listForwardsInDomain function', function() {
    it('should fail if it cannot get API URL', function(done) {
      esnConfigGetMock = () => q.reject(new Error('an_error'));

      getModule().listForwardsInDomain('domain-name').catch(err => {
        expect(err.message).to.equal('an_error');
        done();
      });
    });

    it('should fail if it cannot generate JWT token', function(done) {
      tokenMock.generate = () => q.reject(new Error('an_error'));

      getModule().listForwardsInDomain('domain-name').catch(err => {
        expect(err.message).to.equal('an_error');
        done();
      });
    });

    it('should return an array of forwards in domain if success', function(done) {
      const forward0 = 'user0@domain1.com';
      const forward1 = 'user1@domain1.com';
      const forward2 = 'user2@domain2.com';

      JamesClientMock.prototype.forward = {
        list: sinon.stub().returns(Promise.resolve([forward0, forward1, forward2]))
      };

      getModule().listForwardsInDomain('domain1.com').then(forwards => {
        expect(JamesClientMock.prototype.forward.list).to.have.been.called;
        expect(forwards).to.deep.equal([forward0, forward1]);
        done();
      });
    });
  });
});
