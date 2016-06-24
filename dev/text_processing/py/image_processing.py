import builtins
import re
import pytesseract
import string
import PIL.ImageOps
from PIL import Image
from PIL import ImageGrab
from PIL import ImageEnhance



#Take screenshot
ImageGrab.grab().save("screen_capture.jpg", "JPEG")
img = Image.open('screen_capture.jpg')

basewidth = 5300
img = Image.open('screen_capture.jpg')
wpercent = (basewidth / float(img.size[0]))
hsize = int((float(img.size[1]) * float(wpercent)))
img = img.resize((basewidth, hsize), PIL.Image.ANTIALIAS)
img.save('screen_capture.jpg')


#desaturate
converter = PIL.ImageEnhance.Color(img)
img = converter.enhance(0.0)
img.save('screen_capture.jpg')
img = Image.open('screen_capture.jpg')


#invert
inverted_image = PIL.ImageOps.invert(img)
inverted_image.save('screen_capture.jpg')
img = Image.open('screen_capture.jpg')


#add contrast
contrast = ImageEnhance.Contrast(img)
img = contrast.enhance(2.0)
img.save('screen_capture.jpg')


#Change python encoding and process through tesseract
original_open = open
def bin_open(filename, mode='rb'):
    return original_open(filename, mode)

try:
    builtins.open = bin_open
    bts = pytesseract.image_to_string(img)
finally:
    builtins.open = original_open

#print(str(bts, 'cp1252', 'ignore'))




with open("str.txt","w+") as f:
    f.write(str(bts, 'cp1252', 'ignore'))
f.close()





#Clean string and push in list
bts = open("str.txt")
Msg = bts.readlines()
Msg = [each.replace('>', ' ') for each in Msg]
Msg = [each.replace('!', ' ') for each in Msg]
Msg = [each.replace('<', ' ') for each in Msg]
Msg = [each.replace('â€˜', ' ') for each in Msg]
Msg = [each.replace('â€”', ' ') for each in Msg]
Msg = [each.replace('ï¬', 'fl') for each in Msg]
Msg = [each.replace('/', ' ') for each in Msg]
Msg = [each.replace('\b', ' ') for each in Msg]
Msg = [each.replace('[', ' ') for each in Msg]
Msg = [each.replace(']', ' ') for each in Msg]
Msg = [each.replace('|', ' ') for each in Msg]
Msg = [each.replace('(', ' ') for each in Msg]
Msg = [each.replace(')', ' ') for each in Msg]
#Msg = [each.replace('-', '') for each in Msg] -- Filter for [message] part, may be contained in name
Msg = [each.replace(',', ' ') for each in Msg]
Msg = [each.replace('.', ' ') for each in Msg]
Msg = [each.replace('\n', '') for each in Msg]
Msg = [each.replace('\s \n', '') for each in Msg]
Msg = list(filter(None, Msg))


for i in range(0, len(Msg)):
        print (Msg[i])