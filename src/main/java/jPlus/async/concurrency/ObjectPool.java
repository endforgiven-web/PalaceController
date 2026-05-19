package jPlus.async.concurrency;

import java.util.Enumeration;
import java.util.Hashtable;
import java.util.concurrent.TimeUnit;

/**
 * https://en.wikipedia.org/wiki/Object_pool_pattern
 * Everyone loves a good object pool. This one isn't 10/10
 * but it's 7.3/10! :D This is Marcus btw.
 * <p>
 * So throw down that getInstance or releaseObject
 * method to get or destroy your object.
 * <p>
 * Prime lets you set up the base number of objects. Try out some prime
 * values and see what works for your situation!
 * <p>
 * Finally don't forget to purge when needed. This will clear the pool.
 * Watch that memory. 13k draggable swaths doesn't seem like much
 * but do that 10 times! :O
 */
public abstract class ObjectPool<T> {
    protected long expirationTime;
    private final Hashtable<T, Long> lock, unlock;

    private int primeAmt = 0;

    public ObjectPool() {
        this(TimeUnit.MINUTES.toMillis(1));
    }

    public ObjectPool(long millis) {
        expirationTime = millis;
        lock = new Hashtable<>();
        unlock = new Hashtable<>();
    }

    protected abstract T createObject();

    public abstract boolean validateObject(T o);

    public abstract void expiredObject(T o);

    public synchronized T getInstance() {
//        System.out.println("total pooled items: " + size());

        long now = System.currentTimeMillis();
        T t;
        if (unlock.size() > 0) {
            Enumeration<T> e = unlock.keys();
            while (e.hasMoreElements()) {
                t = e.nextElement();
                if (size() > primeAmt && (now - unlock.get(t)) > expirationTime) {
                    unlock.remove(t);
                    expiredObject(t);
                } else {
                    if (validateObject(t)) {
                        unlock.remove(t);
                        lock.put(t, now);
                        return (t);
                    } else {
                        unlock.remove(t);
                        expiredObject(t);
                    }
                }
            }
        }
        t = createObject();
        lock.put(t, now);
        return (t);
    }

    public synchronized void releaseObject(T t) {
        lock.remove(t);
        unlock.put(t, System.currentTimeMillis() + expirationTime);

    }

    public int size() {
        return lock.size() + unlock.size();
    }

    public void prime(int amt) {
        this.primeAmt = amt;
        while (unlock.size() < primeAmt) unlock.put(createObject(), System.currentTimeMillis() + expirationTime);
    }

    public void purge() {
        if (unlock.size() > 0) {
            Enumeration<T> e = unlock.keys();
            while (e.hasMoreElements()) {
                final T t = e.nextElement();
                if (size() > primeAmt) {
                    unlock.remove(t);
                    expiredObject(t);
                }
            }
        }
    }
}
