from pathlib import Path
import shutil


class LocalFilesClient(object):

    @staticmethod
    def local_import(module_name):
        components = module_name.split('.')
        module = __import__(components[0])
        for comp in components[1:]:
            module = getattr(module, comp)
        return module

    @staticmethod
    def import_module(module_name):
        return LocalFilesClient.local_import(module_name)

    @staticmethod
    def list_files(self, path):
        return [e.name for e in Path(path).iterdir() if e.is_dir() and e.name != '__pycache__']

    @staticmethod
    def save_text_file(path, content):
        path = Path(path)
        path.parent.mkdir(parents=True, exist_ok=True)
        path.write_text(content)
    
    @staticmethod
    def copy_file(source, target):
        shutil.copyfile(source, target)