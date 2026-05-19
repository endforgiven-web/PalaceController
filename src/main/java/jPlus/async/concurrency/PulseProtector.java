package jPlus.async.concurrency;

public class PulseProtector {

    private int count = 0;

    private boolean isChannelOpen = true;

    public PulseProtector() {
    }

    public PulseProtector(boolean isChannelOpen) {
        this.isChannelOpen = isChannelOpen;
    }

    public PulseProtector(int count) {
        this.count = Math.max(count, 0);
    }

    public boolean countDown(){
        if(isChannelOpen){
            count--;
            if(count < 0){
                count = 0;
                return true;
            }
        }

        return false;
    }

    public void addCounts(){
        if(count < 0) count = 0;
        count++;
    }

    public void addCounts(int v){
        if(count < 0) count = 0;
        count += v;
    }

    public void resetCounts(){
        count = 0;
    }

    public boolean isLocked(){
        return !isChannelOpen || count > 0;
    }

    public void openChannel(){
        isChannelOpen = true;
    }

    public void closeChannel(){
        isChannelOpen = false;
    }
}
