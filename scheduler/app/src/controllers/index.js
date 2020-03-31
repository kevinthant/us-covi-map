import CronParser from 'cron-parser';
import path from 'path';
import JsonFileStorage from './../scheduler/storage/json-file';

var config = require('config');

const Jobs = require("../scheduler")({ 
  storage: new JsonFileStorage(path.resolve(__dirname, './../../config/db.json')),
  retentionPeriod: config.get('retentionPeriod'),
  cleanUpInterval: config.get('cleanUpInterval')
});

Jobs.start({intervalMs: 1000});

const normalizeTaskOutput = (task) => {
  return {
    id: task.id,
    job: task.type,
    active: (!task.run_at || task.cron) ? true : false,
    recurring: (task.cron || task.cronRecord) ? true : false,
    lastRunStatus: task.run_at ? (task.error ? 'fail': 'success') : null,
    lastRunDateTime: task.run_at,
    scheduledDateTime: task.due_at,
    cron: task.cron || task.cronRecord,
    output: task.output,
    error: task.error
  };
};

const errorHandler = (res) => (err) => {
  return res.status(500).json({ message: err });
};

module.exports = {
  addSchedule: (req, res) => {
    const { job, after = null, cron = null, data = {}} = req.body.schedule;
    const registeredJobs = Jobs.getRegisteredJobs();
    
    if(!registeredJobs[job]) {
      return res.status(400).json({ message: `Job type ${job} passed is not valid or supported.`});
    }

    if(!after && !cron) {
      return res.status(400).json({ message: 'Either "after" or "cron" property is required to schedule a task'});
    }

    let afterDate = null;
    if(after) {
      afterDate = new Date(after);
    } else if(cron && cron.value) {
      try{
        afterDate = Jobs.getNextDueDateForCron(cron);
      } catch(err) {
        console.error(err);
        return res.status(400).json({ message: `Problem with parsing Cron expression value: ${cron.value}`});
      }
    }
  
    if(!afterDate && !cron) {
      return res.status(400).json({ message: 'Invalid after date string given'});
    }
    else if(!afterDate) {
      return res.status(400).json({ message: 'Invalid cron setting given'});
    }

    if(!cron) {
      return Jobs.schedule(afterDate.toISOString(), registeredJobs[job], data)
        .then((id) => {
          res.json({ id })
        }).catch(errorHandler(res));
    }

    return Jobs.scheduleCron(cron, registeredJobs[job], data)
      .then((id) => {
        res.json({ id })
      }).catch(errorHandler(res));
  },
  listSchedule: (req, res) => {
    const params = req.query;

    if(params.active !== undefined) {
      params.active = params.active === 'true';
    }

    if(params.recurring !== undefined) {
      params.recurring = params.recurring === 'true';
    }

    if(params.job) {
      params.job = params.job.split(',').map((x) => x.trim());
    }

    if(params.lastRunStatus === 'any') {
      delete params.lastRunStatus;
    }

    return Jobs.query((x) => {
      const active = (!x.run_at || x.cron);
      const recurring = x.cron || x.cronRecord;
      const lastRunStatus = x.error ? 'fail' : 'success';

      if(params.active !== undefined && params.active !== active) {
        return false;
      }

      if(params.recurring !== undefined && params.recurring !== recurring) {
        return false;
      }

      if(params.job && params.job.indexOf(x.type) < 0) {
        return false;
      }

      if(params.lastRunStatus && (!x.run_at || params.lastRunStatus !== lastRunStatus)) {
        return false;
      }

      return true;

    }).then((tasks) => {
      const response =  tasks.map(normalizeTaskOutput);

      return res.json(response);
    }).catch(errorHandler(res));
  },
  listJobs: (req, res) => {
    return res.json(Object.keys(Jobs.getRegisteredJobs()));
  },
  removeSchedule: (req, res) => {
    return Jobs.cancel(req.params.id).then((result) => {
      return res.json(result);
    }).catch(errorHandler(res));
  },
  getSchedule: (req, res) => {
    const id = req.params.id;

    return Jobs.query((x) => x.id == id).then((tasks) => {
      const result = tasks && tasks.length > 0 ? normalizeTaskOutput(tasks[0]) : null;
      return res.json(result);
    }).catch(errorHandler(res));
  }
};