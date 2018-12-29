using NtwkMonitor.Server.Abstract;

namespace NtwkMonitor.Server.Logic.Services {

public class ConsoleBeepSoundService : ISoundService {
    public void PlaySound() {
        //core does not have ANY sound playing capabilities
        //except low level OpenAL bindings
        int freq = 700;
        int duration = 400;
        System.Console.Beep(freq, duration);
    }
}

}