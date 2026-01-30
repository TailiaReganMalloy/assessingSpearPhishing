import os
from PIL import Image
import numpy as np


def image_similarity(img1, img2):
    # Resize to smallest common size
    min_shape = (min(img1.size[0], img2.size[0]), min(img1.size[1], img2.size[1]))
    img1 = img1.resize(min_shape)
    img2 = img2.resize(min_shape)
    arr1 = np.asarray(img1).astype(np.float32)
    arr2 = np.asarray(img2).astype(np.float32)
    # Use mean squared error as similarity (lower is more similar)
    mse = np.mean((arr1 - arr2) ** 2)
    # Convert to similarity score (1 = identical, 0 = totally different)
    sim = 1 / (1 + mse)
    return sim

true_img_path = './true_website.png'
true_img = Image.open(true_img_path).convert('RGB')

screenshots_dir = 'screenshots'
model_similarities = {}

for model in os.listdir(screenshots_dir):
    model_path = os.path.join(screenshots_dir, model)
    print(model_path)


    if not os.path.isdir(model_path):
        continue
    similarities = []
    for fname in os.listdir(model_path):
        if fname.endswith('.png'):
            try:
                img = Image.open(os.path.join(model_path, fname)).convert('RGB')
                sim = image_similarity(true_img, img)
                similarities.append(sim)
            except Exception:
                continue
    if similarities:
        model_similarities[model] = float(np.mean(similarities))
    else:
        model_similarities[model] = 'N/A'

# Print or save results
for model, sim in model_similarities.items():
    print(f'{model}: {sim}')
