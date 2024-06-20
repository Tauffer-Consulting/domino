from pathlib import Path

import pytest
from click.testing import CliRunner
from domino.cli import cli


@pytest.fixture
def runner():
    return CliRunner()


def test_create_piece_success_in_pieces_dir_without_repository_path(
    runner, tmpdir, monkeypatch
):
    pieces_path = str(Path(tmpdir.mkdir("pieces")))
    piece_name = "TestPiece"
    monkeypatch.chdir(pieces_path)
    result = runner.invoke(cli.cli_create_piece, ["--name", f"{piece_name}"])
    assert result.exit_code == 0


def test_create_piece_success_in_repository_dir_without_repository_path(
    runner, tmpdir, monkeypatch
):
    repository_path = Path(tmpdir.mkdir("repo"))
    piece_name = "TestPiece"
    monkeypatch.chdir(repository_path)
    result = runner.invoke(cli.cli_create_piece, ["--name", f"{piece_name}"])
    assert result.exit_code == 0


def test_create_piece_success_with_repository_path(runner, tmpdir):
    repository_path = Path(tmpdir.mkdir("repo"))
    tmpdir.mkdir("repo/pieces")
    piece_name = "TestPiece"
    result = runner.invoke(
        cli.cli_create_piece,
        ["--name", f"{piece_name}", "--repository-path", f"{repository_path}"],
    )
    assert result.exit_code == 0


def test_create_piece_success_in_pieces_dir_without_args(runner, tmpdir):
    tmpdir.mkdir("repo")
    tmpdir.mkdir("repo/pieces")
    result = runner.invoke(cli.cli_create_piece)
    assert result.exit_code == 0


@pytest.mark.parametrize(
    "piece_name",
    [
        "1TestPiece",
        "Test",
        "TestPiec",
        "Test Piece",
        "Testpiece",
        "TESTPIECE",
        "",
        " ",
        ".",
    ],
)
def test_create_piece_fail_invalid_piece_name(runner, tmpdir, piece_name):
    repository_path = (Path(tmpdir.mkdir("repo")),)
    result = runner.invoke(
        cli.cli_create_piece,
        ["--name", f"{piece_name}", "--repository-path", f"{repository_path}"],
    )
    if len(piece_name) < 1:
        assert "Piece name must have at least one character." in result.output
    else:
        assert (
            f"Validation Error: {piece_name} is not a valid piece name."
            in result.output
        )


def test_create_piece_already_exists(runner, tmpdir):
    repository_path = Path(tmpdir.mkdir("repo"))
    tmpdir.mkdir("repo/pieces")
    piece_name = "TestPiece"
    runner.invoke(
        cli.cli_create_piece,
        ["--name", f"{piece_name}", "--repository-path", f"{repository_path}"],
    )
    result = runner.invoke(
        cli.cli_create_piece,
        ["--name", f"{piece_name}", "--repository-path", f"{repository_path}"],
    )
    assert f"{piece_name} is already exists" in result.output


def test_create_piece_invalid_pieces_path(runner, tmpdir):
    repository_path = Path(tmpdir.mkdir("repo"))
    piece_name = "TestPiece"
    result = runner.invoke(
        cli.cli_create_piece,
        ["--name", f"{piece_name}", "--repository-path", f"{repository_path}"],
    )
    assert f"{repository_path / 'pieces'} is not a valid repository path."


def test_create_piece_pieces_directory_not_exists(runner, tmpdir, monkeypatch):
    repository_path = Path(tmpdir.mkdir("repo"))
    monkeypatch.chdir(repository_path)
    result = runner.invoke(cli.cli_create_piece, ["--name", "TestPiece"])
    assert "No pieces directory found." in result.output
