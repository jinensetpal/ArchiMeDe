from param.version import Version
__version__ = str(Version(fpath=__file__,archive_commit="$Format:%h$",reponame="pyct"))
del Version
