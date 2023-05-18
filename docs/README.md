Install Sphinx:
```
pip install Sphinx
```

Create docs folder structure:
```
sphinx-quickstart
```

Automatic generation of Sphinx sources [ref](https://www.sphinx-doc.org/en/master/man/sphinx-apidoc.html):
```
sphinx-apidoc -f -o source .. ../*setup*
```

Build documentation:
```
make clean html
```