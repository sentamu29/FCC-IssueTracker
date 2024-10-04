const mongoose = require('mongoose')
const Schema = mongoose.Schema

const IssueSchema = new Schema({
  issue_title: { type: String, required: true },
  issue_text: { type: String, required: true },
  created_on: Date,
  updated_on: Date,
  created_by: { type: String, required: true },
  assigned_to: { type: String },
  open: { type: Boolean },
  status_text: { type: String },
})

module.exports = mongoose.model('Issue', IssueSchema)