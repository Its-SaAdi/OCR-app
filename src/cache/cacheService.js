export class CacheService {
   constructor() {
      this.cache = new Map();
   }

   set(key, value) {
      this.cache.set(key, value);
   }

   get(key) {
      return this.cache.get(key);
   }

   has(key) {
      return this.cache.has(key);
   }

   update(key, value) {
      if (this.cache.has(key)) {
         this.cache.set(key, value);
      }
   }

   clear() {
      this.cache.clear();
      console.log("Cache cleared.");
   }
}

const cacheService = new CacheService();
export default cacheService;
