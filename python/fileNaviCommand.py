"""
File Navigation Commands
"""

import os as _vp_os 
import stat as _vp_stat

def _vp_get_userprofile_path():
    """
    Get UserProfile Path (Home in Linux)
    """
    if _vp_os.name == 'nt':
        # windows
        return _vp_os.getenv('USERPROFILE')
    else:
        # linux
        return _vp_os.getenv('HOME')

def _vp_get_downloads_path():
    """
    Get Download Path
    Returns: the default downloads path for linux or windows
    """
    if _vp_os.name == 'nt':
        # windows
        import winreg
        sub_key = r'SOFTWARE\Microsoft\Windows\CurrentVersion\Explorer\Shell Folders'
        downloads_guid = '{374DE290-123F-4565-9164-39C4925E467B}'
        with winreg.OpenKey(winreg.HKEY_CURRENT_USER, sub_key) as key:
            location = winreg.QueryValueEx(key, downloads_guid)[0]
        return location
    else:
        # linux
        return _vp_os.path.join(_vp_os.path.expanduser('~'), 'downloads')

def _vp_get_desktop_path():
    """
    Get Desktop Path
    """
    if _vp_os.name == 'nt':
        # windows
        return _vp_os.path.join(_vp_get_userprofile_path(), 'Desktop')
    else:
        # linux
        return _vp_os.path.join(_vp_os.path.expanduser('~'), 'Desktop')

def _vp_get_documents_path():
    """
    Get Documents Path
    """
    if _vp_os.name == 'nt':
        # windows
        return _vp_os.path.join(_vp_get_userprofile_path(), 'Documents')
    else:
        # linux
        return _vp_os.path.join(_vp_os.path.expanduser('~'), 'Documents')

def _vp_sizeof_fmt(num, suffix='B'):
    """
    Return resized image
    """
    for unit in ['','K','M','G','T','P','E','Z']:
        if abs(num) < 1024.0:
            return '%3.1f%s%s' % (num, unit, suffix)
        num /= 1024.0
    return '%.1f%s%s' % (num, 'Yi', suffix)
    
def _vp_search_path(path, show_hidden=False):
    """
    Search child folder and file list under the given path
    path: str
        path to search file/dir list
    show_hidden: bool (optional; default: False)
        set True for show hidden file/dir
    returns: list
        list with scanned file/dir list
        0 element with current and parent path information
        1~n elements with file/dir list under given path
    """
    import datetime as _dt
    _current = _vp_os.path.abspath(path)
    _parent = _vp_os.path.dirname(_current)

    with _vp_os.scandir(_current) as i:
        _info = []
        _info.append({'current':_current,'parent':_parent})
        for _entry in i:
            if show_hidden or _vp_check_hidden(_entry.path) == False:
                _name = _entry.name
                _path = _entry.path      # 파일 경로
                _stat = _entry.stat()
                _size = _vp_sizeof_fmt(_stat.st_size)    # 파일 크기
                _a_time = _stat.st_atime # 최근 액세스 시간
                _a_dt = _dt.datetime.fromtimestamp(_a_time).strftime('%Y-%m-%d %H:%M')
                _m_time = _stat.st_mtime # 최근 수정 시간
                _m_dt = _dt.datetime.fromtimestamp(_m_time).strftime('%Y-%m-%d %H:%M')
                _e_type = 'other'
                if _entry.is_file():
                    _e_type = 'file'
                elif _entry.is_dir():
                    _e_type = 'dir'
                _info.append({'name':_name, 'type':_e_type, 'path':_path, 'size':_size, 'atime':str(_a_dt), 'mtime':str(_m_dt)})
        return _info

def _vp_get_image_by_path(path):
    """
    Get image file by path
    """
    from PIL import Image
    img = Image.open(path)
    return img

def _vp_get_relative_path(start, path):
    """
    Get relative path using start path and current path
    start: str
        start path+
    path: str
        current path
    returns: str
        current relative path
    """
    return _vp_os.path.relpath(path, start)

def _vp_check_hidden(path):
    """
    Check if it's hidden
    path: str
        file path
    returns: bool
        True for hidden file/dir, False for others
    """
    return bool(_vp_os.stat(path).st_file_attributes & _vp_stat.FILE_ATTRIBUTE_HIDDEN)