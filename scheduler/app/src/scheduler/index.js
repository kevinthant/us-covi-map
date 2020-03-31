import CronParser from 'cron-parser';
import CovidmapDataUpdate from './jobs/covimap-data-update';

let interval = null
const registeredJobs = {
  [CovidmapDataUpdate.name]: CovidmapDataUpdate
};

const config = {};

module.exports = function Jobs ({storage, retentionPeriod = '1y', cleanUpInterval = 3600000, onError = console.error}) {
  if (!storage) {
    throw new Error("Jobs must specify {storage}")
  }
  
  config.storage = storage;
  config.onError = onError;
  config.retentionTime = parseRetentionPeriod(retentionPeriod);

  //by default every one hour checking to clean up old records as per retention period given
  setInterval(() => selfClean(config.retentionTime), cleanUpInterval); 

  return {cancel, clear, query, register, schedule, scheduleCron, start, stop, getRegisteredJobs, getNextDueDateForCron};
};

function start ({intervalMs}) {
  interval && stop(interval)
  if (isNaN(intervalMs)) {
    throw new Error("Jobs.start must specify {intervalMs: Number}")
  }
  interval = setInterval(checkAndExecuteJobs, intervalMs)
  /* istanbul ignore next */ process.env.DEBUG && console.log("[Jobs] started")
  checkAndExecuteJobs() // run once immediately since interval waits first
}

function stop () {
  clearInterval(interval)
  /* istanbul ignore next */ process.env.DEBUG && console.log("[Jobs] stopped")
}

function register (jobFunc) {
  if (registeredJobs[jobFunc.name]) {
    throw new Error(`[Jobs] already registered ${jobFunc.name}`)
  }
  registeredJobs[jobFunc.name] = jobFunc
}

function getRegisteredJobs() {
  return registeredJobs;
}

async function schedule (due_at, jobFunc, ...argsJson) {
  try {
    if (!registeredJobs[jobFunc.name]) {
      throw new Error(`[Jobs] can't schedule unregistered job ${jobFunc.name}`)
    }
  } catch (error) {
    /* istanbul ignore next */ process.env.DEBUG && console.trace()
    throw error
  }
  /* istanbul ignore next */ process.env.DEBUG && console.log(`[Jobs] scheduling ${jobFunc.name}(${argsJson ? argsJson.map(x => JSON.stringify(x)).join(", ") : ""}) at ${due_at}`);
  return await config.storage.add({ due_at, type: jobFunc.name, args: JSON.stringify(argsJson).replace("'", "''") });
}

async function scheduleCron (cron, jobFunc, ...argsJson) {
  try {
    if (!registeredJobs[jobFunc.name]) {
      throw new Error(`[Jobs] can't schedule unregistered job ${jobFunc.name}`);
    }

  } catch (error) {
    /* istanbul ignore next */ process.env.DEBUG && console.trace()
    throw error
  }
  const nextInterval = getNextDueDateForCron(cron);
  if(nextInterval.done || nextInterval.expired) {
    throw 'Given cron express with end date time has already expired';
  }

  const due_at = nextInterval.value.toISOString();
  /* istanbul ignore next */ process.env.DEBUG && console.log(`[Jobs] scheduling ${jobFunc.name}(${argsJson ? argsJson.map(x => JSON.stringify(x)).join(", ") : ""}) at ${due_at}`);
  return await config.storage.add({ due_at, type: jobFunc.name, args: JSON.stringify(argsJson).replace("'", "''"), cron });
}


function clear () { // for testing only
  Object.keys(registeredJobs).forEach(key => delete registeredJobs[key])
}

async function cancel (jobId) {
  /* istanbul ignore next */ process.env.DEBUG && console.log(`[Jobs] cancelling ${jobId}`)
  return await config.storage.remove((x) => x.id == jobId);
}

async function query (predicate) {
  /* istanbul ignore next */ process.env.DEBUG && console.log("[Jobs] querying jobs")
  return await config.storage.find(predicate);
}

// HELPERS

async function checkAndExecuteJobs () {
  const now = new Date();
  const jobs = await config.storage.find((x) => { return (!x.run_at || x.cron) && new Date(x.due_at) < now; });
  jobs.forEach(async job => {
    try {
      if (!registeredJobs[job.type]) {
        throw new Error(`[Jobs] no registered job of type ${job.type}`)
      }
      let skipRun = false;
      const updatedVals = { run_at: now.toISOString() };
      if(job.cron) {
        const nextInterval = getNextDueDateForCron(job.cron);
        if(nextInterval.done) {
          updatedVals.cron = null;
          updatedVals.cronRecord = job.cron;
          skipRun = nextInterval.expired;
        }
        else {
          updatedVals.due_at = nextInterval.value.toISOString();
        } 
      }

      
      if(skipRun) {
        delete updatedVals['run_at'];
      } 

      config.storage.update(updatedVals, (x) => x.id == job.id);
      !skipRun && runJob(job);
    } catch (error) { config.onError(error, job) }
  })
}

function runJob (job) {
  /* istanbul ignore next */ process.env.DEBUG && console.log(`[Jobs] ${job.id} due_at ${new Date(job.due_at)} run_at ${job.run_at} ${job.type}`)
  const jobFunc = registeredJobs[job.type];
  const jobArgs = JSON.parse(job.args);
  const successHandler = (output) => {
    config.storage.update({ output, error: false }, (x) => x.id == job.id);
  };

  const errorHandler = (error) => {
    console.error(`Error in running task: ${job.id} for ${job.type}\n`, error);
    config.storage.update({ output: false, error }, (x) => x.id == job.id);
  };

  jobArgs && jobArgs.length ? jobFunc(...jobArgs)
  .then(successHandler).catch(errorHandler) : jobFunc().then(successHandler).catch(errorHandler);
}

function getNextDueDateForCron({ value, endDateTime = null }) {
  
  if(endDateTime && new Date(endDateTime) < new Date()) {
    return { done: true, expired: true };
  }

  const cronInterval = CronParser.parseExpression(value, {
    endDate: endDateTime ? new Date(endDateTime) : null,
    iterator: true
  });

  return cronInterval.next();
}

/**
 * Run purging of old records in the databases that are already processed and finished 
 * except cron job
 * @param {int} elapsedTime
 */
function selfClean(elapsedTime) {
  const cutoffDate = new Date(new Date().getTime() - elapsedTime);
  console.log(`\nGoing to clean up records older than ${cutoffDate.toISOString()}\n`);

  config.storage.remove((x) => !x.cron && x.run_at && new Date(x.run_at) <= cutoffDate);
}

function parseRetentionPeriod(retentionPeriod) {

  const re = /([0-9]+)([a-z])/;
  const matches = retentionPeriod.match(re);
  if(!matches) {
    throw `Invalid retention policy given: ${retentionPeriod}`;
  }

  
  const [, qty = null, period = null, ...rest ] = matches;

  let totalTime = 3600 * 1000 * 24;
  switch(period) {
    case 'd':
      totalTime = totalTime * parseInt(qty);
      break;

    case 'm':
      totalTime = totalTime * 30 * parseInt(qty);

    case 'y':
      totalTime = totalTime * 365 * parseInt(qty);
      break;
    
    default:
      throw `Unknow period type given for retention period: ${retentionPeriod}`;
  }

  return totalTime;
}