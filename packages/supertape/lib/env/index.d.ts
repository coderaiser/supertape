type Env = {};
type Config = {
    ts?: boolean;
    css?: boolean;
    dom?: boolean;
    timeout?: number;
};
type Overrides = {
    env: {};
};

export let defineEnv: (config: Config, overrides?: Overrides) => Env;
