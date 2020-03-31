import uuidv1 from 'uuid/v1';

class InMemoryStorage {
  constructor() { 
    this.jobs = [];
  }

  find(predicate) {
    return Promise.resolve(this.jobs.filter(predicate));
  }

  add(data) {
    const id = uuidv1();
    this.jobs.push({...data, id });
    return Promise.resolve(id);
  }

  remove(predicate) {
    this.jobs = this.jobs.filter((x) => !predicate(x));
    return Promise.resolve(true);
  }

  update(keyValPairs, predicate) {
    this.jobs.forEach((x, i) => {
      if(!predicate(x)) {
        return true;
      }

      this.jobs[i] = { ...x, ...keyValPairs };
    });

    return Promise.resolve(true);
  }
}

export default InMemoryStorage;