.. _domino-pieces-page:

Pieces
======================

**Pieces** are the secret sauce of Domino, they are functional units that can be distributed and reused in multiple Workflows. Domino Pieces are special because they:

- can execute anything written in Python, heavy-weight (e.g. Machine Learning) as well as light-weight (e.g. sending emails) tasks
- have well defined data models for inputs, outputs and secrets (using Pydantic)
- run in self-contained and isolated execution environments (Docker containers)
- are immutable, guaranteeing reproducibility of your workflows
- are organized in git repositories, for easy packaging, distribution and installation
- are properly versioned, tested and documented
- are plug-and-play and versatile, can be easily incorporated in any workflow



It is very easy to create and share your own Pieces!

- :ref:`Create your Domino Pieces<domino-pieces-create-page>`
- :ref:`Organize and share your Domino Pieces in repositories<domino-pieces-repo-page>`