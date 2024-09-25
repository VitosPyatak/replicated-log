export class Logger {
    private constructor(private readonly className: string) {}

    public static forClass = (className: string) => {
        return new Logger(className);
    };

    public static base = () => {
        return this.forClass(Logger.name);
    };

    public info = (message: string) => {
        console.info(`[${this.className}]: ${message}`);
    };
}
