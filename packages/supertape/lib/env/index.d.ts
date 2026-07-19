type Env = {
    NODE_OPTIONS: string;
};
type Config = {
    ts?: boolean;
    css?: boolean;
    dom?: boolean;
    nestjs?: boolean;
    timeout?: number;
};
type Overrides = {
    env: {};
};

export let defineEnv: (config: Config, overrides?: Overrides) => Env;
