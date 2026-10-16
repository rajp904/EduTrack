import React, { useState } from 'react';
import {
  Database,
  Terminal,
  ShieldCheck,
  Layers,
  Key,
  CheckCircle2,
  ArrowRight,
  Code2,
  FileText
} from 'lucide-react';

export default function ProjectInfo() {
  const [activeSection, setActiveSection] = useState('design');

  const tabs = [
    { id: 'design', label: 'Document Design', icon: Database },
    { id: 'validation', label: 'Validation', icon: ShieldCheck },
    { id: 'indexes', label: 'Indexes', icon: Key },
    { id: 'aggregations', label: 'Aggregation Queries', icon: Layers },
    { id: 'pymongo', label: 'Python + PyMongo', icon: Terminal },
  ];

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-slate-900 rounded-2xl p-6 sm:p-7 text-white shadow-md border border-slate-800">
        <div className="max-w-3xl">
          <span className="inline-block px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-300 text-xs font-semibold mb-2 border border-indigo-400/30">
            CSE494 Intelligent NoSQL Databases
          </span>
          <h1 className="text-2xl font-bold tracking-tight mb-2">
            Database & Architecture
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
            Overview of the MongoDB database design, schema validation, indexes, 5 aggregation pipelines, and Python PyMongo integration.
          </p>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 overflow-x-auto pb-1 text-xs">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeSection === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveSection(tab.id)}
              className={`px-4 py-2.5 rounded-xl font-semibold flex items-center gap-2 whitespace-nowrap transition-all ${
                isActive
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Tab 1: Document Design */}
      {activeSection === 'design' && (
        <div className="space-y-6">
          {/* Explanation Card */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-sm space-y-4 text-xs">
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Database className="w-5 h-5 text-indigo-600" />
              Four Collections with ObjectId References
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-slate-700 space-y-2">
                <span className="font-bold text-slate-900 block text-sm">
                  Why Separate Collections?
                </span>
                <p className="leading-relaxed">
                  Instead of storing all attendance sessions and marks inside a single student document as large arrays, EduTrack stores them in separate collections (<code className="font-semibold text-indigo-700">students</code>, <code className="font-semibold text-indigo-700">courses</code>, <code className="font-semibold text-indigo-700">attendance</code>, and <code className="font-semibold text-indigo-700">marks</code>).
                </p>
                <p className="leading-relaxed">
                  This keeps student documents small and clean, makes it easy to log attendance for a whole class at once, and allows us to create unique indexes to stop duplicate attendance records.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-slate-700 space-y-2">
                <span className="font-bold text-slate-900 block text-sm">
                  How ObjectId References Work
                </span>
                <p className="leading-relaxed">
                  Every MongoDB document has a unique <code className="font-mono bg-white px-1.5 py-0.5 rounded border border-slate-200 text-slate-800">_id</code> called an <strong>ObjectId</strong>.
                </p>
                <p className="leading-relaxed">
                  In the <code className="font-semibold">attendance</code> and <code className="font-semibold">marks</code> collections, each record stores <code className="font-mono bg-white px-1 rounded border border-slate-200">studentId</code> and <code className="font-mono bg-white px-1 rounded border border-slate-200">courseId</code> pointing to those documents. When we need student or course details in reports, we connect them using MongoDB's <code className="font-semibold text-indigo-700">$lookup</code> stage, just like a join in SQL.
                </p>
              </div>
            </div>
          </div>

          {/* Document Schemas */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 text-xs">
            {/* Students */}
            <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm">
              <div className="flex items-center justify-between mb-2">
                <span className="font-bold text-slate-900 text-sm">1. students collection</span>
                <span className="font-mono text-[11px] text-slate-400">Stores student profiles</span>
              </div>
              <pre className="p-3.5 rounded-xl bg-slate-900 text-slate-200 font-mono text-[11px] overflow-x-auto leading-relaxed">
{`{
  "_id": ObjectId("6ad0e94e..."),
  "registrationNumber": "REG2024001",
  "name": "Aarav Mehta",
  "email": "aarav.mehta@edutrack.edu",
  "department": "Computer Science",
  "semester": 6,
  "enrollmentDate": ISODate("2022-08-01")
}`}
              </pre>
            </div>

            {/* Courses */}
            <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm">
              <div className="flex items-center justify-between mb-2">
                <span className="font-bold text-slate-900 text-sm">2. courses collection</span>
                <span className="font-mono text-[11px] text-slate-400">Curriculum offerings</span>
              </div>
              <pre className="p-3.5 rounded-xl bg-slate-900 text-slate-200 font-mono text-[11px] overflow-x-auto leading-relaxed">
{`{
  "_id": ObjectId("6ad0e94e..."),
  "courseCode": "CSE494",
  "courseName": "Intelligent NoSQL Databases",
  "department": "Computer Science",
  "credits": 4,
  "semester": 6,
  "facultyName": "Dr. Rajesh Sharma"
}`}
              </pre>
            </div>

            {/* Attendance */}
            <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm">
              <div className="flex items-center justify-between mb-2">
                <span className="font-bold text-slate-900 text-sm">3. attendance collection</span>
                <span className="font-mono text-[11px] text-slate-400">Class attendance logs</span>
              </div>
              <pre className="p-3.5 rounded-xl bg-slate-900 text-slate-200 font-mono text-[11px] overflow-x-auto leading-relaxed">
{`{
  "_id": ObjectId("6ad0eb92..."),
  "studentId": ObjectId("6ad0e94e..."),
  "courseId": ObjectId("6ad0e94e..."),
  "date": ISODate("2024-02-05"),
  "status": "Present",  // "Present" or "Absent"
  "remarks": "Regular session"
}`}
              </pre>
            </div>

            {/* Marks */}
            <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm">
              <div className="flex items-center justify-between mb-2">
                <span className="font-bold text-slate-900 text-sm">4. marks collection</span>
                <span className="font-mono text-[11px] text-slate-400">Assessment marks</span>
              </div>
              <pre className="p-3.5 rounded-xl bg-slate-900 text-slate-200 font-mono text-[11px] overflow-x-auto leading-relaxed">
{`{
  "_id": ObjectId("6ad0eb92..."),
  "studentId": ObjectId("6ad0e94e..."),
  "courseId": ObjectId("6ad0e94e..."),
  "assessmentName": "Midterm Exam",
  "marksObtained": 42.5,
  "maximumMarks": 50,
  "assessmentDate": ISODate("2024-03-20")
}`}
              </pre>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Validation */}
      {activeSection === 'validation' && (
        <div className="space-y-6 text-xs">
          {/* Overview */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-sm space-y-4">
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-emerald-600" />
              Two-Tier Validation: Database Level & Application Level
            </h3>
            <p className="text-slate-600 leading-relaxed">
              EduTrack uses two levels of validation to protect academic data integrity:
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 rounded-xl bg-indigo-50/70 border border-indigo-200/70 text-indigo-950">
                <span className="font-bold text-sm block mb-1 text-indigo-900">
                  1. Database-Level Validation ($jsonSchema)
                </span>
                <p className="leading-relaxed text-slate-700">
                  Configured directly inside MongoDB. Even if someone writes a Python script or uses a terminal to insert bad data, MongoDB will immediately reject it with an error.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-slate-800">
                <span className="font-bold text-sm block mb-1 text-slate-900">
                  2. Application-Level Validation (Node.js & Express)
                </span>
                <p className="leading-relaxed text-slate-600">
                  Checks user input when submitted through the web app, returning clear, friendly error messages to the browser before sending the query to the database.
                </p>
              </div>
            </div>
          </div>

          {/* 4 Core Validation Rules */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-sm space-y-4">
            <h4 className="text-sm font-bold text-slate-900">
              Key Validation Rules Enforced
            </h4>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                <div className="flex items-center gap-2 font-bold text-slate-900 mb-1">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>Required Fields</span>
                </div>
                <p className="text-slate-600 leading-relaxed">
                  Documents cannot be saved without mandatory fields. For example, a student must have <code className="font-semibold text-slate-800">registrationNumber</code>, <code className="font-semibold text-slate-800">name</code>, <code className="font-semibold text-slate-800">email</code>, and <code className="font-semibold text-slate-800">department</code>.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                <div className="flex items-center gap-2 font-bold text-slate-900 mb-1">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>Valid Attendance Status</span>
                </div>
                <p className="text-slate-600 leading-relaxed">
                  Attendance status is strictly limited to <span className="font-bold text-emerald-700">Present</span> or <span className="font-bold text-rose-700">Absent</span> using an enum rule. Any other status (like 'Late' or 'Excuse') is rejected.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                <div className="flex items-center gap-2 font-bold text-slate-900 mb-1">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>Marks Between Zero and Maximum</span>
                </div>
                <p className="text-slate-600 leading-relaxed">
                  <code className="font-semibold text-slate-800">marksObtained</code> cannot be negative (minimum 0), and <code className="font-semibold text-slate-800">maximumMarks</code> must be at least 1. Scores outside this range are blocked.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                <div className="flex items-center gap-2 font-bold text-slate-900 mb-1">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>Unique Identifiers</span>
                </div>
                <p className="text-slate-600 leading-relaxed">
                  Unique indexes prevent duplicate student registration numbers, duplicate emails, duplicate course codes, and duplicate attendance records for the same student, course, and date.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 3: Indexes */}
      {activeSection === 'indexes' && (
        <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-sm space-y-5 text-xs">
          <div>
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2 mb-1">
              <Key className="w-5 h-5 text-amber-500" />
              Essential MongoDB Indexes
            </h3>
            <p className="text-slate-600 leading-relaxed">
              An index speeds up search queries and enforces uniqueness without scanning the entire collection.
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border border-slate-200 rounded-xl overflow-hidden">
              <thead className="bg-slate-50 text-slate-700 font-bold border-b border-slate-200">
                <tr>
                  <th className="p-3">Collection</th>
                  <th className="p-3">Index Field(s)</th>
                  <th className="p-3">Type</th>
                  <th className="p-3">Purpose</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-600">
                <tr>
                  <td className="p-3 font-semibold text-slate-900">students</td>
                  <td className="p-3 font-mono text-indigo-700">registrationNumber: 1</td>
                  <td className="p-3 font-bold text-emerald-700">Unique Index</td>
                  <td className="p-3">Prevents duplicate student IDs and enables instant student lookups.</td>
                </tr>
                <tr>
                  <td className="p-3 font-semibold text-slate-900">students</td>
                  <td className="p-3 font-mono text-indigo-700">email: 1</td>
                  <td className="p-3 font-bold text-emerald-700">Unique Index</td>
                  <td className="p-3">Guarantees every student has a unique email address.</td>
                </tr>
                <tr>
                  <td className="p-3 font-semibold text-slate-900">courses</td>
                  <td className="p-3 font-mono text-indigo-700">courseCode: 1</td>
                  <td className="p-3 font-bold text-emerald-700">Unique Index</td>
                  <td className="p-3">Guarantees unique course codes (e.g., CSE494).</td>
                </tr>
                <tr>
                  <td className="p-3 font-semibold text-slate-900">attendance</td>
                  <td className="p-3 font-mono text-indigo-700">{`{ studentId: 1, courseId: 1, date: 1 }`}</td>
                  <td className="p-3 font-bold text-purple-700">Compound Unique</td>
                  <td className="p-3">Prevents marking attendance twice for the same student, course, and date.</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 4: Aggregation Queries */}
      {activeSection === 'aggregations' && (
        <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-sm space-y-5 text-xs">
          <div>
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2 mb-1">
              <Layers className="w-5 h-5 text-indigo-600" />
              Five Core Aggregation Pipelines
            </h3>
            <p className="text-slate-600 leading-relaxed">
              MongoDB aggregation pipelines process documents step-by-step through stages to calculate statistics and reports:
            </p>
          </div>

          <div className="space-y-3">
            {[
              {
                num: 1,
                title: 'Student Count by Department',
                purpose: 'Groups students by their department and counts how many students are enrolled in each.',
                stages: '$group, $sort'
              },
              {
                num: 2,
                title: 'Average Marks by Course',
                purpose: 'Calculates the average, highest, and lowest marks for each course, and joins course details.',
                stages: '$group, $lookup, $unwind, $project'
              },
              {
                num: 3,
                title: 'Average Marks by Student',
                purpose: 'Calculates each student\'s overall percentage across all assessments and joins student info.',
                stages: '$group, $lookup, $unwind, $project, $sort'
              },
              {
                num: 4,
                title: 'Attendance Percentage and Students Below 75%',
                purpose: 'Calculates attendance percentage as (Present / Total Classes) * 100 and highlights students below 75%.',
                stages: '$group, $project, $match, $lookup, $sort'
              },
              {
                num: 5,
                title: 'Top Five Students by Average Marks',
                purpose: 'Finds the five highest scoring students across the entire institution.',
                stages: '$group, $lookup, $sort, $limit'
              }
            ].map((p) => (
              <div key={p.num} className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 space-y-1.5">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5">
                  <div className="font-bold text-slate-900 text-sm">
                    Pipeline {p.num}: {p.title}
                  </div>
                  <span className="font-mono text-[11px] bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded border border-indigo-200 font-semibold self-start sm:self-auto">
                    {p.stages}
                  </span>
                </div>
                <p className="text-slate-600 text-xs">
                  {p.purpose}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 5: Python + PyMongo */}
      {activeSection === 'pymongo' && (
        <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-sm space-y-5 text-xs">
          <div>
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2 mb-1">
              <Terminal className="w-5 h-5 text-emerald-600" />
              Python + PyMongo Integration
            </h3>
            <p className="text-slate-600 leading-relaxed">
              PyMongo is the official Python library for MongoDB. In this project, Python scripts connect directly to the shared <code className="font-bold text-slate-800">edutrack</code> database to perform CRUD operations, test validation, and run aggregations.
            </p>
          </div>

          <div className="space-y-3">
            <h4 className="font-bold text-slate-900 text-sm">
              Python Scripts in python/ Directory:
            </h4>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
                <span className="font-mono font-bold text-indigo-700 block text-xs mb-1">
                  connection_test.py
                </span>
                <p className="text-slate-600 text-[11px] leading-relaxed">
                  Pings the local MongoDB database, verifies connectivity, and prints document counts for all 4 collections.
                </p>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
                <span className="font-mono font-bold text-indigo-700 block text-xs mb-1">
                  crud_operations.py
                </span>
                <p className="text-slate-600 text-[11px] leading-relaxed">
                  Demonstrates Create, Read, Update, and Delete operations using PyMongo, including cascading delete of related records.
                </p>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
                <span className="font-mono font-bold text-indigo-700 block text-xs mb-1">
                  validation_demo.py
                </span>
                <p className="text-slate-600 text-[11px] leading-relaxed">
                  Demonstrates that MongoDB's database engine actively rejects invalid emails, bad attendance status, negative marks, and duplicate keys.
                </p>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
                <span className="font-mono font-bold text-indigo-700 block text-xs mb-1">
                  aggregations.py
                </span>
                <p className="text-slate-600 text-[11px] leading-relaxed">
                  Runs the 5 core aggregation pipelines in Python and prints formatted summary tables to the terminal using tabulate.
                </p>
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
              <span className="font-mono font-bold text-indigo-700 block text-xs mb-1">
                main.py (Interactive CLI Menu)
              </span>
              <p className="text-slate-600 text-[11px] leading-relaxed">
                Provides a simple terminal menu to run any of the Python scripts with one keypress during a viva demonstration.
              </p>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-slate-900 text-slate-200 font-mono text-[11px] space-y-1.5">
            <div className="text-emerald-400 font-bold mb-1"># Command to run during your viva presentation:</div>
            <div>./python/venv/bin/python python/main.py</div>
          </div>
        </div>
      )}
    </div>
  );
}
