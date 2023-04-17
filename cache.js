class Cache {
  cache = new Map();
  clearTimeouts = {};
  revalidateTimeouts = {};

  get(key) {
    return this.cache.get(key);
  }

  set(key, value, options = {}) {
    const { clear = true, clearTimeout = 60 } = options;

    this.cache.set(key, value);

    if (clear) {
      this.deleteClearTimeout(key);

      const timeout = setTimeout(() => {
        this.delete(key);

        delete this.clearTimeouts[key];
      }, clearTimeout * 1000);

      this.clearTimeouts[key] = timeout;
    }
  }

  delete(key) {
    this.deleteClearTimeout(key);
    this.deleteRevalidateTimeout(key);
    return this.cache.delete(key);
  }

  has(key) {
    return this.cache.has(key);
  }

  clear() {
    this.cache.clear();
    this.deleteAllClearTimeouts();
    this.deleteAllRevalidateTimeouts();
  }

  revalidate(key, callback, timeout) {
    const timeoutKey = setTimeout(async () => {
      try {
        delete this.revalidateTimeouts[key];

        const data = await callback();

        if (data) {
          this.set(key, data);
        }
      } catch (e) {
        console.error('revalidate', key, e);
      }
    }, (timeout || 60) * 1000);

    this.revalidateTimeouts[key] = timeoutKey;
  }

  deleteClearTimeout(key) {
    const timeout = this.clearTimeouts[key];

    if (timeout) {
      clearTimeout(timeout);
      delete this.clearTimeouts[key];
    }
  }

  deleteAllClearTimeouts() {
    for (const key in this.clearTimeouts) {
      this.deleteClearTimeout(key);
    }
  }

  deleteRevalidateTimeout(key) {
    const timeout = this.revalidateTimeouts[key];

    if (timeout) {
      clearTimeout(timeout);
      delete this.revalidateTimeouts[key];
    }
  }

  deleteAllRevalidateTimeouts() {
    for (const key in this.revalidateTimeouts) {
      this.deleteRevalidateTimeout(key);
    }
  }
}

export default Cache;
