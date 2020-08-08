from numpy import expand_dims
from tensorflow.keras.preprocessing.image import load_img, img_to_array, save_img, ImageDataGenerator
import matplotlib.pyplot as plt

img = load_img('images/1500.jpg')
data = img_to_array(img)
samples = expand_dims(data, 0)
gen = ImageDataGenerator(brightness_range=[0.3, 1.7],
                         rotation_range=10,
                         zoom_range=[0.8, 1.2],
                         width_shift_range=0.2,
                         height_shift_range=0.2,
                         fill_mode="nearest")
it = gen.flow(samples, batch_size=1)
for i in range(9):
    print("Collecting: Image", i)
    plt.subplot(330 + 1 + i)
    batch = it.next()
    image = batch[0].astype('uint8')
    plt.imshow(image)
    save_img('image.jpg', image)
    print("Augmented: Image", i)
plt.subplot(330 + 1 + 10)
plt.imshow(img)
plt.show()
