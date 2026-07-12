class X {
    /* c8 ignore next 3*/
    constructor(
        @Inject('SNIPPETS') private readonly snippets: Map<string, Snippet>,
        @Inject('SNIPPET_REVISIONS') private readonly snippetRevisions: Map<string, SnippetRevision>
    ) {}
    
    add() {}
}

class Y {
    // hello
    constructor(
        @Inject('SNIPPETS') private readonly snippets: Map<string, Snippet>,
        @Inject('SNIPPET_REVISIONS') private readonly snippetRevisions: Map<string, SnippetRevision>
    ) {}
    
    add() {}
}

class Z {
    /* c8 ignore next 3*/
    constructor(
        @Inject('SNIPPETS') private readonly snippets: Map<string, Snippet>,
        @Inject('SNIPPET_REVISIONS') private readonly snippetRevisions: Map<string, SnippetRevision>
    ) {}
    /* world */
    add() {}
}
