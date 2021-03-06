'use strict';

const request = require('supertest');
const expect = require('chai').expect;
const path = require('path');
const MODULE_NAME = 'linagora.esn.james';

describe('/token API', () => {
  let app, deployOptions, adminUser, regularUser;
  let core;
  const password = 'secret';

  beforeEach(function(done) {
    this.helpers.modules.initMidway(MODULE_NAME, err => {
      expect(err).to.not.exist;
      const application = require(this.testEnv.backendPath + '/webserver/application')(this.helpers.modules.current.deps);
      const api = require(this.testEnv.backendPath + '/webserver/api')(this.helpers.modules.current.deps, this.helpers.modules.current.lib.lib);

      application.use(require('body-parser').json());
      application.use('/api', api);

      app = this.helpers.modules.getWebServer(application);
      deployOptions = {
        fixtures: path.normalize(`${__dirname}/../../fixtures/deployments`)
      };

      this.helpers.api.applyDomainDeployment('general', deployOptions, (err, models) => {
        if (err) {
          return done(err);
        }
        adminUser = models.users[0];
        regularUser = models.users[1];
        core = this.testEnv.core;
        done();
      });
    });
  });

  beforeEach(function(done) {
    this.helpers.jwt.saveTestConfiguration(done);
  });

  afterEach(function(done) {
    this.helpers.mongo.dropDatabase((err) => {
      if (err) return done(err);
      this.testEnv.core.db.mongo.mongoose.connection.close(done);
    });
  });

  describe('POST /token', function() {
    it('should respond 401 if not logged in', function(done) {
      this.helpers.api.requireLogin(app, 'post', '/api/token', done);
    });

    it('should respond 403 if the user is not platform admin or domain admin', function(done) {
      this.helpers.api.loginAsUser(app, regularUser.emails[0], password, (err, requestAsMember) => {
        expect(err).to.not.exist;

        requestAsMember(request(app).post('/api/token'))
          .expect(403)
          .end((err, res) => {
            expect(err).to.not.exist;
            expect(res.body.error.details).to.equal('User is not the domain manager');
            done();
          });
      });
    });

    it('should return 200 with JWT token if user is domain admin', function(done) {
      this.helpers.api.loginAsUser(app, adminUser.emails[0], password, (err, requestAsMember) => {
        expect(err).to.not.exist;

        requestAsMember(request(app).post('/api/token'))
          .expect(200)
          .end((err, res) => {
            expect(err).to.not.exist;
            expect(res.body).to.exist;
            done();
          });
      });
    });

    it('should respond 200 with JWT token if user is platform admin', function(done) {
      core.platformadmin
        .addPlatformAdmin(regularUser)
        .catch(err => done(err || 'failed to add platformadmin'))
        .then(() => {
          // now the regularUser became platform admin
          const platformAdminUser = regularUser;

          this.helpers.api.loginAsUser(app, platformAdminUser.emails[0], password, (err, requestAsMember) => {
            expect(err).to.not.exist;
            requestAsMember(request(app).post('/api/token'))
              .expect(200)
              .end((err, res) => {
                expect(err).to.not.exist;
                expect(res.body).to.exist;
                done();
              });
          });
        });
    });
  });
});
