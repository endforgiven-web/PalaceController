package jPlus.async.command;

public interface ICommand extends Runnable {
    void terminate();

    void reverse();
}
