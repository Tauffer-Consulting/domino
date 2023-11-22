from enum import Enum


class DisplayResultFileType(str, Enum):
    png = "png"
    jpeg = "jpeg"
    bmp = "bmp"
    gif = "gif"
    tiff = "tiff"
    svg = "svg"
    txt = "txt"
    json = "json"
    md = "md"
    pdf = "pdf"
    html = "html"
    plotly_json = "plotly_json"