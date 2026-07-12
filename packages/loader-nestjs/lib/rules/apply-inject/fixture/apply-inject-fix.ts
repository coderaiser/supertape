class X {
    constructor(
        @Inject('GithubService') private readonly githubService: GithubService,
        @Inject(GithubService) private readonly githubService: GithubService,
        @Inject(GithubService) private readonly githubService: GithubService
    ) {}
}
