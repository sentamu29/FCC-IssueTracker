'use strict'
const mongoose = require('mongoose')
const IssueModel = require('../models/IssueModel')
const ProjectModel = require('../models/ProjectModel')

module.exports = function (app) {
  app
    .route('/api/issues/:project')

    .get(async (req, res) => {
      const project = req.params.project
      const { _id, open, issue_title, issue_text, created_by, assigned_to, status_text } = req.query
      try {
        const data = await ProjectModel.findOne({ name: project }).populate('issues')
        if (!data) return res.json([])
        let issues = data.issues
        if (_id) {
          issues = issues.filter((issue) => issue._id.toString() === _id)
        }
        if (open) {
          issues = issues.filter((issue) => issue.open === open)
        }
        if (issue_title) {
          issues = issues.filter((issue) => issue.issue_title === issue_title)
        }
        if (issue_text) {
          issues = issues.filter((issue) => issue.issue_text === issue_text)
        }
        if (created_by) {
          issues = issues.filter((issue) => issue.created_by === created_by)
        }
        if (assigned_to) {
          issues = issues.filter((issue) => issue.assigned_to === assigned_to)
        }
        if (status_text) {
          issues = issues.filter((issue) => issue.status_text === status_text)
        }

        res.json(issues)
      } catch (error) {
        console.log(error)
      }
    })

    .post(async (req, res) => {
      const project = req.params.project
      const { issue_title, issue_text, created_by, assigned_to, status_text } = req.body
      if (!issue_title || !issue_text || !created_by)
        return res.json({ error: 'required field(s) missing' })

      const newIssue = new IssueModel({
        issue_title: issue_title || '',
        issue_text: issue_text || '',
        created_on: new Date(),
        updated_on: new Date(),
        created_by: created_by || '',
        assigned_to: assigned_to || '',
        open: true,
        status_text: status_text || '',
      })
      try {
        // find project if exists
        const proj = await ProjectModel.findOne({ name: project })
        if (!proj) {
          const newProject = new ProjectModel({ name: project })
          newProject.issues.push(newIssue)
          await newProject.save()
          await newIssue.save()
          return res.json(newIssue)
        }

        proj.issues.push(newIssue)
        await proj.save()
        await newIssue.save()
        res.json(newIssue)
      } catch (error) {
        console.log(error)
        res.send('There was an error saving the post')
      }
    })

    .put(async (req, res) => {
      const project = req.params.project
      const { _id, issue_title, issue_text, created_by, assigned_to, status_text, open } = req.body
      if (!_id) return res.json({ error: 'missing _id' })
      if (!issue_title && !issue_text && !created_by && !assigned_to && !status_text && !open)
        return res.json({ error: 'no update field(s) sent', _id })

      try {
        const issue = await IssueModel.findOne({ _id })
        if (!issue) return res.json({ error: 'could not update', _id })
        issue.issue_title = issue_title || issue.issue_title
        issue.issue_text = issue_text || issue.issue_text
        issue.created_by = created_by || issue.created_by
        issue.assigned_to = assigned_to || issue.assigned_to
        issue.status_text = status_text || issue.status_text
        issue.updated_on = new Date()
        issue.open = open

        await issue.save()

        res.json({ result: 'successfully updated', _id })
      } catch (error) {
        console.log(error)
        res.json({ error: 'could not update', _id })
      }
    })

    .delete(async (req, res) => {
      let project = req.params.project;
      const { _id } = req.body;
      
      if (!_id) return res.json({ error: 'missing _id' });
      
      try {
          // Find the issue
          const issue = await IssueModel.findOne({ _id });
          
          // Check if the issue exists
          if (!issue) {
              return res.json({ error: 'could not delete', _id: _id });
          }
          
          // Delete the issue
          await IssueModel.deleteOne({ _id });
          
          // Remove the issue ID from the project's issues array
          await ProjectModel.updateMany({ name: project }, { $pull: { issues: _id } });
          
          res.json({ result: 'successfully deleted', _id: _id });
      } catch (error) {
          console.log(error);
          res.json({ error: 'could not delete', _id: _id });
      }
  });
  
}