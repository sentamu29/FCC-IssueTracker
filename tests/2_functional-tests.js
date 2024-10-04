const chaiHttp = require('chai-http');
const chai = require('chai');
const assert = chai.assert;
const server = require('../server');
const api_url = '/api/issues/apitest123';

chai.use(chaiHttp);

let issueID;

suite('Functional Tests', function () {
    suite('POST', () => {
        // #1
        test('Create an issue with every field', (done) => {
            chai
                .request(server)
                .keepOpen()
                .post(api_url)
                .send({
                    issue_title: 'Api_test1',
                    issue_text: 'this is an api test #1',
                    created_by: 'ApiTester',
                    assigned_to: 'ApiTester',
                    status_text: 'test'
                })
                .end((err, res) => {
                    const output = res.body;
                    issueID = output._id;
                    assert.equal(res.status, 200, 'api should response');
                    assert.isObject(output, 'output should be Object');
                    assert.equal(output.issue_title, 'Api_test1');
                    assert.equal(output.issue_text, 'this is an api test #1');
                    assert.equal(output.created_by, 'ApiTester');
                    assert.equal(output.assigned_to, 'ApiTester');
                    assert.equal(output.status_text, 'test');
                    assert.property(output, 'created_on');
                    assert.property(output, 'updated_on');
                    assert.property(output, '_id');
                    assert.equal(output._id, issueID); // check equal value
                    done();
                })
        });
        // #2
        test('Create an issue with only required fields', (done) => {
            chai
                .request(server)
                .keepOpen()
                .post(api_url)
                .send({
                    issue_title: 'Api_test2',
                    issue_text: 'this is an api test #2',
                    created_by: 'ApiTester',
                })
                .end((err, res) => {
                    const output = res.body
                    assert.equal(res.status, 200, 'api should response');
                    assert.isObject(output, 'output should be Object');
                    assert.equal(output.issue_title, 'Api_test2');
                    assert.equal(output.issue_text, 'this is an api test #2');
                    assert.equal(output.created_by, 'ApiTester');
                    assert.property(output, 'assigned_to');
                    assert.property(output, 'status_text');
                    assert.property(output, 'created_on');
                    assert.property(output, 'updated_on');
                    assert.property(output, '_id');
                    done();
                })
        });
        // #3
        test('Create an issue with missing required fields', (done) => {
            chai
                .request(server)
                .keepOpen()
                .post(api_url)
                .send({
                    assigned_to: 'ApiTester',
                    status_text: 'test'
                })
                .end((err, res) => {
                    const output = res.body
                    assert.equal(res.status, 200, 'api should response');
                    assert.isObject(output, 'output should be Object');
                    assert.property(output, 'error');
                    assert.equal(output.error, 'required field(s) missing');
                    done()
                })
        });
    });
    suite('GET', () => {
        // #4
        test('View all issues on a project', (done) => {
            chai
                .request(server)
                .keepOpen()
                .get(api_url)
                .end((err, res) => {
                    const output = res.body
                    assert.equal(res.status, 200, 'api should response');
                    assert.equal(res.type, "application/json");
                    assert.isArray(output, 'output is array of object');
                    done()
                })
        });
        // #5
        test('View issuses on a project with one filter', (done) => {
            chai
                .request(server)
                .keepOpen()
                .get(api_url)
                .query({ 'issue_title': 'Api_test1' })
                .end((err, res) => {
                    const output = res.body
                    assert.equal(res.status, 200, 'api should response');
                    assert.equal(res.type, "application/json");
                    assert.isArray(output, 'output is array of object');
                    assert.equal(output[0].issue_title, 'Api_test1', 'filter with issue_title');
                    done();
                })
        });
        // #6
        test('View issuses on a project with mulitiple filters', (done) => {
            chai
                .request(server)
                .keepOpen()
                .get(api_url)
                .query({
                    'issue_title': 'Api_test1',
                    'status_text': 'test'
                })
                .end((err, res) => {
                    const output = res.body
                    assert.equal(res.status, 200, 'api should response');
                    assert.equal(res.type, "application/json");
                    assert.isArray(output, 'output is array of object');
                    assert.equal(output[0].issue_title, 'Api_test1', 'filter with issue_title');
                    assert.equal(output[0].status_text, 'test', 'filter with status_text');
                    done();
                })
        });
    });
    suite('PUT', () => {
        // #7
        test('Update one field on an issue', (done) => {
            chai
                .request(server)
                .keepOpen()
                .put(api_url)
                .send({
                    _id: issueID,
                    issue_title: 'Api_Test3'
                })
                .end((err, res) => {
                    const output = res.body
                    assert.equal(res.status, 200, 'api should response');
                    assert.equal(res.type, "application/json");
                    assert.isObject(output, 'output is an object');
                    assert.propertyVal(output, 'result', 'successfully updated');
                    assert.propertyVal(output, '_id', issueID);
                    done();
                })
        });
        // #8
        test('Update multiple fields on an issue', (done) => {
            chai
                .request(server)
                .keepOpen()
                .put(api_url)
                .send({
                    _id: issueID,
                    issue_title: 'Api_Test4',
                    issue_text: 'This is update 3 times'
                })
                .end((err, res) => {
                    const output = res.body
                    assert.equal(res.status, 200, 'api should response');
                    assert.equal(res.type, "application/json");
                    assert.isObject(output, 'output is an object');
                    assert.propertyVal(output, 'result', 'successfully updated');
                    assert.propertyVal(output, '_id', issueID);
                    done();
                })
        });
        // #9
        test('Update an issue with missing _id', (done) => {
            chai
                .request(server)
                .keepOpen()
                .put(api_url)
                .send({
                    issue_title: 'Api_Test5'
                })
                .end((err, res) => {
                    const output = res.body
                    assert.equal(res.status, 200, 'api should response');
                    assert.equal(res.type, "application/json");
                    assert.isObject(output, 'output is an object');
                    assert.propertyVal(output, 'error', 'missing _id');
                    done();
                })
        });
        // #10
        test('Update an issue with no fields to update', (done) => {
            chai
                .request(server)
                .keepOpen()
                .put(api_url)
                .send({
                    _id: issueID
                })
                .end((err, res) => {
                    const output = res.body
                    assert.equal(res.status, 200, 'api should response');
                    assert.equal(res.type, "application/json");
                    assert.isObject(output, 'output is an object');
                    assert.propertyVal(output, 'error', 'no update field(s) sent');
                    assert.propertyVal(output, '_id', issueID);
                    done();
                })
        });
        // #11
        test('Update an issue with an invalid _id', (done) => {
            chai
                .request(server)
                .keepOpen()
                .put(api_url)
                .send({
                    _id: '123456',
                    issue_title: 'Api_Test6'
                })
                .end((err, res) => {
                    const output = res.body
                    assert.equal(res.status, 200, 'api should response');
                    assert.equal(res.type, "application/json");
                    assert.isObject(output, 'output is an object');
                    assert.propertyVal(output, 'error', 'could not update');
                    assert.propertyVal(output, '_id', '123456');
                    done();
                })
        });
    });
    suite('DELETE: /api/issues/apitest', () => {
        // #12
        test('Delete an issue', (done) => {
            chai
                .request(server)
                .keepOpen()
                .delete(api_url)
                .send({
                    _id: issueID,
                })
                .end((err, res) => {
                    const output = res.body
                    assert.equal(res.status, 200, 'api should response');
                    assert.equal(res.type, "application/json");
                    assert.isObject(output, 'output is an object');
                    assert.propertyVal(output, 'result', 'successfully deleted');
                    assert.propertyVal(output, '_id', issueID);
                    done();
                })
        });
        // #13
        test('Delete an issue with invalid _id', (done) => {
            chai
                .request(server)
                .keepOpen()
                .delete(api_url)
                .send({
                    _id: issueID,
                })
                .end((err, res) => {
                    const output = res.body
                    assert.equal(res.status, 200, 'api should response');
                    assert.equal(res.type, "application/json");
                    assert.isObject(output, 'output is an object');
                    assert.propertyVal(output, 'error', 'could not delete');
                    assert.propertyVal(output, '_id', issueID);
                    done();
                })
        });
        // #14
        test('Delete an issue with missing _id', (done) => {
            chai
                .request(server)
                .keepOpen()
                .delete(api_url)
                .end((err, res) => {
                    const output = res.body
                    assert.equal(res.status, 200, 'api should response');
                    assert.equal(res.type, "application/json");
                    assert.isObject(output, 'output is an object');
                    assert.propertyVal(output, 'error', 'missing _id');
                    done();
                })
        });
    });
});