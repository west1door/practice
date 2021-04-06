class CustomPromise {
  constructor(execFn) {
    this.status = 'pending';
    this.value = undefined;
    this.fulfilledCallbacks = [];
    this.rejectedCallbacks = [];
    execFn(this.triggerResolve.bind(this), this.triggerReject.bind(this));
  }

  triggerResolve(val) {
    setTimeout(() => {
      if (this.status !== 'pending') return;
      if (val instanceof CustomPromise) {
        val.then(
          res => {
          },
          err => {
          });
      } else {
        this.status = 'fulfilled';
        this.value = val;
        this.fulfilledCallbacks.forEach(callback => {
          callback(val);
        });
        this.fulfilledCallbacks = [];
      }
    }, 0);
  }

  triggerReject() {
    setTimeout(() => {
      if (this.status !== 'pending') return;
      if (val instanceof CustomPromise) {
        val.then(
          res => {
            this.triggerResolve(res);
          },
          err => {
            this.triggerReject(err);
          });
      } else {
        this.status = 'rejected';
        this.value = val;
        this.rejectedCallbacks.forEach(callback => {
          callback(val);
        });
        this.rejectedCallbacks = [];
      }
    }, 0);
  }

  then(onFulfilled, onRejected) {
    return new CustomPromise((onNextFulfilled, onNextRejected) => {
      const { status, value } = this;
      const onFinalFulfilled = (val) => {
        if (typeof onFulfilled !== 'function') {
          onNextFulfilled(val);
        } else {
          let res;
          try {
            res = onFulfilled(val);
          } catch (e) {
            onNextRejected(e);
          }
          if (res instanceof CustomPromise) {
            res.then(onNextFulfilled, onNextRejected);
          } else {
            onNextFulfilled(res);
          }
        }
      };
      const onFinalRejected = (error) => {
        if (typeof onRejected !== 'function') {
          onNextRejected(error);
        } else {
          let res;
          try {
            res = onRejected(val);
          } catch (e) {
            onNextRejected(e);
          }
          if (res instanceof CustomPromise) {
            res.then(onNextFulfilled, onNextRejected);
          } else {
            onNextFulfilled(res);
          }
        }
      };

      switch(status) {
        case 'pending': {
          this.fulfilledCallbacks.push(onFinalFulfilled);
          this.rejectedCallbacks.push(onFinalRejected);
          break;
        }
        case 'fulfilled': {
          onNextFulfilled(value);
          break;
        }
        case 'rejected': {
          onNextRejected(value);
          break;
        }
      }
    })
  }

  catch(onRejected) {
    this.then(null, onRejected);
  }

  static resolve(val) {
    if (val instanceof CustomPromise) return val;
    return new CustomPromise(resolve => resolve(val));
  }

  static reject(val) {
    if (val instanceof CustomPromise) return val;
    return new CustomPromise((resolve, reject) => reject(val));
  }

  static all(list) {
    return new CustomPromise((resolve, reject) => {
      let count = 0;
      const res = [];
      list.forEach((item, i) => {
        CustomPromise.resolve(item).then(val => {
          count++;
          res[i] = val;
          if (count === list.length) {
            resolve(res);
          }
        }, error => {
          reject(error);
        })
      })
    })
  }

  static race() {
    return new CustomPromise((resolve, reject) => {
      list.forEach((item, i) => {
        CustomPromise.resolve(item).then(val => {
          resolve(res);
        }, error => {
          reject(error);
        })
      })
    })
  }
}
