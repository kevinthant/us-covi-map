import uuidv1 from 'uuid/v1';
const low = require('lowdb');
const FileSync = require('lowdb/adapters/FileSync');

 

class JsonFileStorage {
  constructor(jsonFile) { 
    const adapter = new FileSync(jsonFile);
    this.db = low(adapter);
    this.db.defaults({ jobs: [] }).write();
    this.jobs = this.db.get('jobs').value();
  }

  find(predicate) {
    return Promise.resolve(this.jobs.filter(predicate));
  }

  add(data) {
    const id = uuidv1();
    this.db.get('jobs')
      .push({...data, id })
      .write();

    this.jobs = this.db.get('jobs')
      .value();

    return Promise.resolve(id);
  }

  remove(predicate) {
    this.jobs = this.jobs.filter((x) => !predicate(x));
    this.db.set('jobs', this.jobs)
      .write();
    return Promise.resolve(true);
  }

  update(keyValPairs, predicate) {
    this.jobs.forEach((x, i) => {
      if(!predicate(x)) {
        return true;
      }

      this.jobs[i] = { ...x, ...keyValPairs };
    });

    this.db.set('jobs', this.jobs)
      .write();
    return Promise.resolve(true);
  }
}

export default JsonFileStorage;