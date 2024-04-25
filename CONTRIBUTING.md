# Contributing to Domino

- [Contributing to Domino](#contributing-to-domino)
  - [Issues](#issues)
    - [Issues guidance links](#issues-guidance-links)
    - [Submitting an issue](#submitting-an-issue)
  - [Pull Requests](#pull-requests)
    - [Step 1 - Fork](#step-1---fork)
    - [Step 2 - Branch](#step-2---branch)
    - [Step 3 - Setting up](#step-3---setting-up)
    - [Step 4 - Code](#step-4---code)
    - [Step 5 - Commit and Push](#step-5---commit-and-push)
    - [Step 6 - Opening the pull request](#step-6---opening-the-pull-request)
  - [Developer's Certificate of Origin](#developers-certificate-of-origin)

## Issues

### Issues guidance links

* [Asking for General Help](https://github.com/Tauffer-Consulting/domino/discussions)
* [Discussing non-technical topics](https://github.com/Tauffer-Consulting/domino/discussions)
* [Submitting a Bug Report](https://github.com/Tauffer-Consulting/domino/issues/new/choose)

### Submitting an issue

When opening a new issue in the Tauffer-Consulting/domino issue tracker, users will be presented with a choice of issue templates. If you believe that you have uncovered a bug in Domino, please fill out the Bug Report template to the best of your ability. Do not worry if you cannot answer every detail; just fill in what you can.

The two most important pieces of information we need in order to properly evaluate the report is a description of the behavior you are seeing and a simple test case we can use to recreate the problem on our own. If we cannot recreate the issue, it becomes impossible for us to fix.

Once an issue has been opened, it is common for there to be discussion around it. Some contributors may have differing opinions about the issue, including whether the behavior being seen is a bug or a feature. This discussion is part of the process and should be kept focused, helpful, and professional.

## Pull Requests

A pull request is a proposal to merge a set of changes from one branch into another. In a pull request, collaborators can review and discuss the proposed set of changes before they integrate the changes into the main codebase.

Before opening a pull request, be sure you read and agree with our [Developer's Certificate of Origin](#developers-certificate-of-origin).

### Step 1 - Fork

Fork the project [on GitHub](https://github.com/Tauffer-Consulting/domino) and clone your fork
locally.

```bash
git clone git@github.com:username/domino.git
cd domino
git remote add upstream https://github.com/Tauffer-Consulting/domino
git fetch upstream
```

### Step 2 - Branch

As a best practice to keep your development environment as organized as possible, create local branches to work within. These should also be created directly off of the upstream developer branch.

```bash
git checkout -b my-branch -t upstream/dev
```

### Step 3 - Setting up

Setting up your [local environment](https://docs.domino-workflows.io/quickstart) properly. Be sure to run the application **before** making any changes.

### Step 4 - Code

Pull requests in Domino typically involve changes to
one or more of a few places in the repository.

* Python code code contained in the `rest` directory make changes in domino-rest service, who provides the communication between airflow and Domino UI.
* TypeScript code contained in the `frontend` directory make changes in Domino UI.
* Python code code contained in the `src` directory make changes in domino-py lib.

### Step 5 - Commit and Push

A good commit message should describe what changed and why.

 Examples:

   * `feature(frontend): add button to create workspace`
   * `fix(rest): fix roles authorization on create workspace`

If your patch fixes an open issue, you can add a reference to it at the end of the log(for that, add a blank line after the first part of commit). Use the `Fixes:` prefix and the issue reference. For other references use `Refs:`.

Examples:
  * ```feature(frontend): add button to create workspace
   
    Refs: #53
   ```

  * ```fix(rest): fix roles authorization on create workspace
  
    Fixes: #32
  ```

As a best practice, once you have committed your changes, it is a good idea
to use `git rebase` (not `git merge`) to synchronize your work with the main
repository.

```bash
git fetch upstream dev
git rebase dev
```

This ensures that your working branch has the latest changes from `Tauffer-Consulting/domino` development branch.

### Step 6 - Opening the pull request

From within GitHub, opening a new pull request will present you with a [pull request template](https://github.com/Tauffer-Consulting/domino/compare). Please try to do your best at filling out the details, but feel free to skip parts if you're not sure what to put.

Once opened, pull requests are usually reviewed within a few days.

To get feedback on your proposed change even though it is not ready to land, use the `Convert to draft` option in the GitHub UI.
Do not use the `wip` label as it might not prevent the PR
from landing before you are ready.

<a id="developers-certificate-of-origin"></a>

## Developer's Certificate of Origin

<pre>
By making a contribution to this project, I certify that:

 (a) The contribution was created in whole or in part by me and I
     have the right to submit it under the open source license
     indicated in the file; or

 (b) The contribution is based upon previous work that, to the best
     of my knowledge, is covered under an appropriate open source
     license and I have the right under that license to submit that
     work with modifications, whether created in whole or in part
     by me, under the same open source license (unless I am
     permitted to submit under a different license), as indicated
     in the file; or

 (c) The contribution was provided directly to me by some other
     person who certified (a), (b) or (c) and I have not modified
     it.

 (d) I understand and agree that this project and the contribution
     are public and that a record of the contribution (including all
     personal information I submit with it, including my sign-off) is
     maintained indefinitely and may be redistributed consistent with
     this project or the open source license(s) involved.
</pre>