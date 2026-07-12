import {Inject} from '@nestjs/common';

class X {
    constructor(
        @Inject(GithubService) private readonly githubService: GithubService
    ) {}
}
