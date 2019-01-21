let mouth = ["mouth_left_corner",
  "mouth_right_corner",
  "mouth_lower_lip_left_contour1", "mouth_upper_lip_left_contour3", "mouth_lower_lip_top",
  "mouth_upper_lip_bottom", "mouth_upper_lip_right_contour3", "mouth_lower_lip_right_contour1"];

let left_eye = ["left_eye_left_corner", "left_eye_upper_left_quarter", "left_eye_top", "left_eye_upper_right_quarter",
  "left_eye_right_corner", "left_eye_lower_right_quarter", "left_eye_bottom",
  "left_eye_lower_left_quarter", "left_eye_center", "left_eye_lower_right_quarter"];

let right_eye = ["right_eye_left_corner", "right_eye_upper_left_quarter", "right_eye_top", "right_eye_upper_right_quarter",
  "right_eye_right_corner", "right_eye_lower_right_quarter", "right_eye_bottom",
  "right_eye_lower_left_quarter", "right_eye_center", "right_eye_lower_right_quarter"];

let left_eyebrow = ["left_eyebrow_left_corner", "left_eyebrow_upper_left_quarter", "left_eyebrow_lower_left_quarter",
  "left_eyebrow_upper_middle", "left_eyebrow_lower_middle", "left_eyebrow_upper_right_quarter",
  "left_eyebrow_lower_right_quarter", "left_eyebrow_right_corner"];

let right_eyebrow = ["right_eyebrow_left_corner", "right_eyebrow_upper_left_quarter", "right_eyebrow_lower_left_quarter",
  "right_eyebrow_upper_middle", "right_eyebrow_lower_middle", "right_eyebrow_upper_right_quarter",
  "right_eyebrow_lower_right_quarter", "right_eyebrow_right_corner"];

let five_landmark = ["left_eye_center", "right_eye_center", "nose_tip"];

function o_sim(a, b) {
  let res = 0
  for (let i = 0; i < a.length; i++) {
    let item = 0
    for (let j = 0; j < a[i].length; j++) {
      item += (a[i][j] - b[i][j])**2
    }
    res += item
  }
  return Math.sqrt(res)
}

function oSimOneLevel (a, b) {
  return magnitude(sub(nor(a), nor(b)));
}

function nor(arr) {
  return arr.reduce((a, b) => {
    return a.concat(Array.isArray(b) ? nor(b) : b)
  }, [])
}

function sub(arrA, arrB) {
  let res = []
  for (let i = 0; i < Math.max(arrA.length, arrB.length); i++) {
    res.push(arrA[i] - arrB[i])
  }
  return res
}

function magnitude(arr) {
  if (!arr.length)
    return 0;

  var result = 0,
    data = arr,
    i, l;
  for (i = 0, l = arr.length; i < l; i++)
    result += data[i] * data[i];

  return Math.sqrt(result);
}

/*
*
*
* def o_sim(a, b):
    vec1 = np.array(a)
    vec2 = np.array(b)
    dist = np.linalg.norm(vec1 - vec2)
    return dist
* */

function resize(lmk_s, width_s, lmk_t, width_t, landmark) {
  let vec_t = [];
  let vec_s = [];
  landmark.forEach(keypoint => {
    let x = lmk_t[keypoint]["x"];
    let y = lmk_t[keypoint]["y"];
    x *= 100.0 / width_t;
    y *= 100.0 / width_t;
    vec_t.push([ x, y ] );
    x = lmk_s[keypoint]["x"];
    y = lmk_s[keypoint]["y"];
    x *= 100.0 / width_s;
    y *= 100.0 / width_s;
    vec_s.push([x, y]);
  });
  return [vec_t, vec_s];
}

/*
* def resize(lmk_s, width_s, lmk_t, width_t, landmark):
    vec_t = []
    vec_s = []
    for keypoint in landmark:
        x = lmk_t[keypoint]['x']
        y = lmk_t[keypoint]['y']
        x *= 100.0 / width_t
        y *= 100.0 / width_t
        vec_t.push([x, y])
        x = lmk_s[keypoint]['x']
        y = lmk_s[keypoint]['y']
        x *= 100.0 / width_s
        y *= 100.0 / width_s
        vec_s.push([x, y])
    return vec_t, vec_s
*/

function get_rect(vector) {
  let left = 100000;
  let top = 100000;
  let right = 0;
  let bottom = 0;
  vector.forEach(([ x, y ]) => {
    if (x < left) left = x;
    if (x > right) right = x;
    if (y < top) top = y;
    if (y > bottom) bottom = y;
  });
  return [left, top, right, bottom];
}

/*
* def get_rect(vector):
    left = 100000
    top = 100000
    right = 0
    bottom = 0
    for x, y in vector:
        if x < left:
            left = x
        if x > right:
            right = x
        if y < top:
            top = y
        if y > bottom:
            bottom = y
    return left, top, right, bottom
*/

function get_position(vector, rect) {
  let result = [];
  let left = rect[0];
  let top = rect[1];
  vector.forEach(([x, y]) => {
    let n_x = x - left;
    let n_y = y - top;
    result.push([n_x, n_y]);
  });
  return result;
}

/*
* def get_position(vector, rect):
    result = []
    left = rect[0]
    top = rect[1]
    for x, y in vector:
        n_x = x - left
        n_y = y - top
        result.push([n_x, n_y])
    return result

*
* */

function cut_part(vec_t, vec_s) {
  const rect_t = get_rect(vec_t);
  const rect_s = get_rect(vec_s);
  return [get_position(vec_t, rect_t), get_position(vec_s, rect_s)];
}

/*
*
* def cut_part(vec_t, vec_s):
    rect_t = get_rect(vec_t)
    rect_s = get_rect(vec_s)
    return get_position(vec_t, rect_t), get_position(vec_s, rect_s)
* */

function landmark_distance(lmk_s, width_s, lmk_t, width_t, landmark) {
  let [vec_t, vec_s] = resize(lmk_s, width_s, lmk_t, width_t, landmark);
  [vec_t, vec_s] = cut_part(vec_t, vec_s);
  let distance = o_sim(vec_t, vec_s);
  return distance;
}

/*
* def landmark_distance(lmk_s, width_s, lmk_t, width_t, landmark):
    vec_t, vec_s = resize(lmk_s, width_s, lmk_t, width_t, landmark)
    vec_t, vec_s = cut_part(vec_t, vec_s)
    distance = o_sim(vec_t, vec_s)
    # print(distance)
    return distance
*
* */

function eyebrow_center(vector) {
  let result = [];
  result.push(vector[0]);
  result.push([(vector[1][0] + vector[2][0]) * 0.5, (vector[1][1] + vector[2][1]) * 0.5]);
  result.push([(vector[3][0] + vector[4][0]) * 0.5, (vector[3][1] + vector[4][1]) * 0.5]);
  result.push([(vector[5][0] + vector[6][0]) * 0.5, (vector[5][1] + vector[6][1]) * 0.5]);
  result.push(vector[7]);
  return result;
}

/*
def eyebrow_center(vector):
    result = []
    result.push(vector[0])
    result.push([(vector[1][0] + vector[2][0]) * 0.5, (vector[1][1] + vector[2][1]) * 0.5])
    result.push([(vector[3][0] + vector[4][0]) * 0.5, (vector[3][1] + vector[4][1]) * 0.5])
    result.push([(vector[5][0] + vector[6][0]) * 0.5, (vector[5][1] + vector[6][1]) * 0.5])
    result.push(vector[7])
    return result
* */

function eyebrow_distance(lmk_s, width_s, lmk_t, width_t, landmark) {
  let [vec_t, vec_s] = resize(lmk_s, width_s, lmk_t, width_t, landmark);
  vec_t = eyebrow_center(vec_t);
  vec_s = eyebrow_center(vec_s);
  [vec_t, vec_s] = cut_part(vec_t, vec_s);
  let distance = o_sim(vec_t, vec_s);
  return distance;
}

/*
* def eyebrow_distance(lmk_s, width_s, lmk_t, width_t, landmark):
    vec_t, vec_s = resize(lmk_s, width_s, lmk_t, width_t, landmark)
    vec_t = eyebrow_center(vec_t)
    vec_s = eyebrow_center(vec_s)
    vec_t, vec_s = cut_part(vec_t, vec_s)
    distance = o_sim(vec_t, vec_s)
    # print(distance)
    return distance
*/

function read_pose(faces) {
  let item = faces;
  let landmark = item["landmark"];
  let headpose = item["attributes"]["headpose"];
  let yaw = headpose["yaw_angle"];
  let pitch = headpose["pitch_angle"];
  let roll = headpose["roll_angle"];
  let face_rect = item["face_rectangle"];
  return [landmark, yaw, pitch, roll, face_rect];
}


/*
* def read_pose(j):

*
* */

function distance(json_t, width_t, json_s, width_s) {
  let [lmk_s, yaw_s, pitch_s, roll_s, face_rect_s] = read_pose(json_s);
  let [lmk_t, yaw_t, pitch_t, roll_t, face_rect_t] = read_pose(json_t);

  // 整体缩放到100 x 100
  let [vec_t, vec_s] = resize(lmk_s, width_s, lmk_t, width_t, five_landmark);
  //# 比较 眼睛 + 鼻子的3个点的欧式距离
  let entire_distance = o_sim(vec_t, vec_s);

  //# 然后对于每个part，获取左上为原点坐标系的位置，然后比较欧式距离
  let left_eyebrow_distance = eyebrow_distance(lmk_s, width_s, lmk_t, width_t, left_eyebrow);
  let right_eyebrow_distance = eyebrow_distance(lmk_s, width_s, lmk_t, width_t, right_eyebrow);
  let left_eye_distance = landmark_distance(lmk_s, width_s, lmk_t, width_t, left_eye);
  let right_eye_distance = landmark_distance(lmk_s, width_s, lmk_t, width_t, right_eye);
  let mouth_distance = landmark_distance(lmk_s, width_s, lmk_t, width_t, mouth);
  let part_distance = left_eyebrow_distance + right_eyebrow_distance + left_eye_distance + right_eye_distance + 1.5 * mouth_distance;

  //# 除以原图大小
  let source_origin_width = 100.0 * face_rect_s["width"] / width_s;
  part_distance /= source_origin_width;
  entire_distance /= source_origin_width;
  let final_distance = part_distance + 0.15 * entire_distance;
  return final_distance;
}

/*
* def distance(json_t, width_t, json_s, width_s):
    lmk_s, yaw_s, pitch_s, roll_s, face_rect_s = read_pose(json_s)
    lmk_t, yaw_t, pitch_t, roll_t, face_rect_t = read_pose(json_t)

    # 整体缩放到100 x 100
    vec_t, vec_s = resize(lmk_s, width_s, lmk_t, width_t, five_landmark)
    # 比较 眼睛 + 鼻子的3个点的欧式距离
    entire_distance = o_sim(vec_t, vec_s)

    # 然后对于每个part，获取左上为原点坐标系的位置，然后比较欧式距离
    left_eyebrow_distance = eyebrow_distance(lmk_s, width_s, lmk_t, width_t, left_eyebrow)
    right_eyebrow_distance = eyebrow_distance(lmk_s, width_s, lmk_t, width_t, right_eyebrow)
    left_eye_distance = landmark_distance(lmk_s, width_s, lmk_t, width_t, left_eye)
    right_eye_distance = landmark_distance(lmk_s, width_s, lmk_t, width_t, right_eye)
    mouth_distance = landmark_distance(lmk_s, width_s, lmk_t, width_t, mouth)
    part_distance = left_eyebrow_distance + right_eyebrow_distance + left_eye_distance + right_eye_distance + 1.5 * mouth_distance

    # 除以原图大小
    source_origin_width = 100.0 * float(face_rect_s['width']) / width_s
    part_distance /= source_origin_width
    entire_distance /= source_origin_width
    final_distance = part_distance + 0.15 * entire_distance
    return final_distance
*
* */

function classify(score) {
  if (score <= 0.40) {
    return "王者";
  } else if (score <= 0.45) {
    return "钻石";
  } else if (score <= 0.57) {
    return "黄金";
  } else if (score <= 0.67) {
    return "白银";
  } else {
    return "青铜";
  }
}

/*
* def classify(score):
    if score <= 0.40:
        return '王者'
    elif score <= 0.45:
        return '钻石'
    elif score <= 0.57:
        return '黄金'
    elif score <= 0.67:
        return '白银'
    else:
        return '青铜'
*
* */


var jsonT = {
  "image_id": "qRvin9l00Kt0ghccdNYuuw==",
  "request_id": "1546145011,ae91c25e-a0cd-476c-9a2b-f602dd4d5754",
  "time_used": 263,
  "faces": [
    {
      "landmark": {
        "mouth_upper_lip_left_contour2": {
          "y": 456,
          "x": 280
        },
        "mouth_upper_lip_top": {
          "y": 447,
          "x": 320
        },
        "mouth_upper_lip_left_contour1": {
          "y": 444,
          "x": 304
        },
        "left_eye_upper_left_quarter": {
          "y": 292,
          "x": 227
        },
        "left_eyebrow_lower_middle": {
          "y": 258,
          "x": 230
        },
        "mouth_upper_lip_left_contour3": {
          "y": 466,
          "x": 292
        },
        "right_eye_top": {
          "y": 291,
          "x": 400
        },
        "left_eye_bottom": {
          "y": 314,
          "x": 243
        },
        "right_eyebrow_lower_left_quarter": {
          "y": 261,
          "x": 386
        },
        "right_eye_pupil": {
          "y": 300,
          "x": 401
        },
        "mouth_lower_lip_right_contour1": {
          "y": 486,
          "x": 355
        },
        "mouth_lower_lip_right_contour3": {
          "y": 512,
          "x": 351
        },
        "mouth_lower_lip_right_contour2": {
          "y": 495,
          "x": 371
        },
        "contour_chin": {
          "y": 585,
          "x": 322
        },
        "contour_left9": {
          "y": 573,
          "x": 279
        },
        "left_eye_lower_right_quarter": {
          "y": 312,
          "x": 261
        },
        "mouth_lower_lip_top": {
          "y": 492,
          "x": 321
        },
        "right_eyebrow_upper_middle": {
          "y": 232,
          "x": 411
        },
        "left_eyebrow_left_corner": {
          "y": 261,
          "x": 182
        },
        "right_eye_bottom": {
          "y": 311,
          "x": 402
        },
        "contour_left7": {
          "y": 520,
          "x": 221
        },
        "contour_left6": {
          "y": 489,
          "x": 198
        },
        "contour_left5": {
          "y": 456,
          "x": 180
        },
        "contour_left4": {
          "y": 419,
          "x": 169
        },
        "contour_left3": {
          "y": 381,
          "x": 162
        },
        "contour_left2": {
          "y": 343,
          "x": 160
        },
        "contour_left1": {
          "y": 304,
          "x": 161
        },
        "left_eye_lower_left_quarter": {
          "y": 309,
          "x": 226
        },
        "contour_right1": {
          "y": 303,
          "x": 491
        },
        "contour_right3": {
          "y": 382,
          "x": 488
        },
        "contour_right2": {
          "y": 342,
          "x": 491
        },
        "mouth_left_corner": {
          "y": 475,
          "x": 266
        },
        "contour_right4": {
          "y": 421,
          "x": 482
        },
        "contour_right7": {
          "y": 525,
          "x": 429
        },
        "right_eyebrow_left_corner": {
          "y": 263,
          "x": 358
        },
        "nose_right": {
          "y": 400,
          "x": 379
        },
        "nose_tip": {
          "y": 393,
          "x": 325
        },
        "contour_right5": {
          "y": 459,
          "x": 471
        },
        "nose_contour_lower_middle": {
          "y": 420,
          "x": 325
        },
        "left_eyebrow_lower_left_quarter": {
          "y": 259,
          "x": 205
        },
        "mouth_lower_lip_left_contour3": {
          "y": 512,
          "x": 295
        },
        "right_eye_right_corner": {
          "y": 300,
          "x": 434
        },
        "right_eye_lower_right_quarter": {
          "y": 307,
          "x": 420
        },
        "mouth_upper_lip_right_contour2": {
          "y": 454,
          "x": 364
        },
        "right_eyebrow_lower_right_quarter": {
          "y": 256,
          "x": 440
        },
        "left_eye_left_corner": {
          "y": 301,
          "x": 213
        },
        "mouth_right_corner": {
          "y": 473,
          "x": 385
        },
        "mouth_upper_lip_right_contour3": {
          "y": 465,
          "x": 353
        },
        "right_eye_lower_left_quarter": {
          "y": 310,
          "x": 384
        },
        "left_eyebrow_right_corner": {
          "y": 265,
          "x": 283
        },
        "left_eyebrow_lower_right_quarter": {
          "y": 262,
          "x": 256
        },
        "right_eye_center": {
          "y": 302,
          "x": 401
        },
        "nose_left": {
          "y": 400,
          "x": 270
        },
        "mouth_lower_lip_left_contour1": {
          "y": 487,
          "x": 291
        },
        "left_eye_upper_right_quarter": {
          "y": 294,
          "x": 264
        },
        "right_eyebrow_lower_middle": {
          "y": 258,
          "x": 413
        },
        "left_eye_top": {
          "y": 288,
          "x": 245
        },
        "left_eye_center": {
          "y": 303,
          "x": 245
        },
        "contour_left8": {
          "y": 548,
          "x": 248
        },
        "contour_right9": {
          "y": 576,
          "x": 366
        },
        "right_eye_left_corner": {
          "y": 307,
          "x": 368
        },
        "mouth_lower_lip_bottom": {
          "y": 519,
          "x": 322
        },
        "left_eyebrow_upper_left_quarter": {
          "y": 238,
          "x": 200
        },
        "left_eye_pupil": {
          "y": 300,
          "x": 247
        },
        "right_eyebrow_upper_left_quarter": {
          "y": 241,
          "x": 380
        },
        "contour_right8": {
          "y": 553,
          "x": 400
        },
        "right_eyebrow_right_corner": {
          "y": 256,
          "x": 465
        },
        "right_eye_upper_left_quarter": {
          "y": 295,
          "x": 382
        },
        "left_eyebrow_upper_middle": {
          "y": 233,
          "x": 230
        },
        "right_eyebrow_upper_right_quarter": {
          "y": 236,
          "x": 443
        },
        "nose_contour_left1": {
          "y": 311,
          "x": 295
        },
        "nose_contour_left2": {
          "y": 374,
          "x": 282
        },
        "mouth_upper_lip_right_contour1": {
          "y": 443,
          "x": 336
        },
        "nose_contour_right1": {
          "y": 312,
          "x": 349
        },
        "nose_contour_right2": {
          "y": 374,
          "x": 366
        },
        "mouth_lower_lip_left_contour2": {
          "y": 496,
          "x": 277
        },
        "contour_right6": {
          "y": 494,
          "x": 453
        },
        "nose_contour_right3": {
          "y": 412,
          "x": 354
        },
        "nose_contour_left3": {
          "y": 412,
          "x": 296
        },
        "left_eye_right_corner": {
          "y": 308,
          "x": 277
        },
        "left_eyebrow_upper_right_quarter": {
          "y": 242,
          "x": 261
        },
        "right_eye_upper_right_quarter": {
          "y": 293,
          "x": 418
        },
        "mouth_upper_lip_bottom": {
          "y": 464,
          "x": 321
        }
      },
      "attributes": {
        "emotion": {
          "sadness": 0.057,
          "neutral": 0.306,
          "disgust": 96.631,
          "anger": 0.179,
          "surprise": 0.09,
          "fear": 0.019,
          "happiness": 2.717
        },
        "gender": {
          "value": "Male"
        },
        "age": {
          "value": 32
        },
        "eyestatus": {
          "left_eye_status": {
            "normal_glass_eye_open": 0.009,
            "no_glass_eye_close": 0,
            "occlusion": 0,
            "no_glass_eye_open": 99.991,
            "normal_glass_eye_close": 0,
            "dark_glasses": 0
          },
          "right_eye_status": {
            "normal_glass_eye_open": 0.006,
            "no_glass_eye_close": 0,
            "occlusion": 0,
            "no_glass_eye_open": 99.993,
            "normal_glass_eye_close": 0,
            "dark_glasses": 0
          }
        },
        "glass": {
          "value": "None"
        },
        "headpose": {
          "yaw_angle": 0.22408399,
          "pitch_angle": 6.7615123,
          "roll_angle": -0.41456863
        },
        "blur": {
          "blurness": {
            "threshold": 50,
            "value": 0.464
          },
          "motionblur": {
            "threshold": 50,
            "value": 0.464
          },
          "gaussianblur": {
            "threshold": 50,
            "value": 0.464
          }
        },
        "smile": {
          "threshold": 50,
          "value": 71.873
        },
        "facequality": {
          "threshold": 70.1,
          "value": 93.29
        },
        "ethnicity": {
          "value": "ASIAN"
        }
      },
      "face_rectangle": {
        "width": 353,
        "top": 232,
        "left": 149,
        "height": 353
      },
      "face_token": "0adf25e360701607eddcada29e8b4fb7"
    }
  ]
}
var jsonS = {
  "image_id": "XPu7BK3Oc8QQjh6hVDG6gA==",
  "request_id": "1546144372,1286012b-e8fb-4810-bb50-b531b34ddf4a",
  "time_used": 284,
  "faces": [
    {
      "landmark": {
        "mouth_upper_lip_left_contour2": {
          "y": 150,
          "x": 126
        },
        "mouth_upper_lip_top": {
          "y": 149,
          "x": 142
        },
        "mouth_upper_lip_left_contour1": {
          "y": 148,
          "x": 136
        },
        "left_eye_upper_left_quarter": {
          "y": 103,
          "x": 112
        },
        "left_eyebrow_lower_middle": {
          "y": 90,
          "x": 114
        },
        "mouth_upper_lip_left_contour3": {
          "y": 154,
          "x": 130
        },
        "right_eye_top": {
          "y": 102,
          "x": 172
        },
        "left_eye_bottom": {
          "y": 110,
          "x": 118
        },
        "right_eyebrow_lower_left_quarter": {
          "y": 92,
          "x": 166
        },
        "right_eye_pupil": {
          "y": 106,
          "x": 172
        },
        "mouth_lower_lip_right_contour1": {
          "y": 165,
          "x": 158
        },
        "mouth_lower_lip_right_contour3": {
          "y": 174,
          "x": 156
        },
        "mouth_lower_lip_right_contour2": {
          "y": 166,
          "x": 164
        },
        "contour_chin": {
          "y": 201,
          "x": 142
        },
        "contour_left9": {
          "y": 198,
          "x": 129
        },
        "left_eye_lower_right_quarter": {
          "y": 109,
          "x": 124
        },
        "mouth_lower_lip_top": {
          "y": 169,
          "x": 143
        },
        "right_eyebrow_upper_middle": {
          "y": 83,
          "x": 177
        },
        "left_eyebrow_left_corner": {
          "y": 93,
          "x": 96
        },
        "right_eye_bottom": {
          "y": 109,
          "x": 172
        },
        "contour_left7": {
          "y": 179,
          "x": 110
        },
        "contour_left6": {
          "y": 168,
          "x": 103
        },
        "contour_left5": {
          "y": 157,
          "x": 97
        },
        "contour_left4": {
          "y": 144,
          "x": 93
        },
        "contour_left3": {
          "y": 131,
          "x": 91
        },
        "contour_left2": {
          "y": 118,
          "x": 91
        },
        "contour_left1": {
          "y": 106,
          "x": 92
        },
        "left_eye_lower_left_quarter": {
          "y": 109,
          "x": 112
        },
        "contour_right1": {
          "y": 109,
          "x": 204
        },
        "contour_right3": {
          "y": 135,
          "x": 201
        },
        "contour_right2": {
          "y": 122,
          "x": 203
        },
        "mouth_left_corner": {
          "y": 155,
          "x": 119
        },
        "contour_right4": {
          "y": 148,
          "x": 199
        },
        "contour_right7": {
          "y": 183,
          "x": 179
        },
        "right_eyebrow_left_corner": {
          "y": 92,
          "x": 155
        },
        "nose_right": {
          "y": 134,
          "x": 161
        },
        "nose_tip": {
          "y": 131,
          "x": 143
        },
        "contour_right5": {
          "y": 161,
          "x": 194
        },
        "nose_contour_lower_middle": {
          "y": 141,
          "x": 143
        },
        "left_eyebrow_lower_left_quarter": {
          "y": 91,
          "x": 105
        },
        "mouth_lower_lip_left_contour3": {
          "y": 173,
          "x": 131
        },
        "right_eye_right_corner": {
          "y": 106,
          "x": 183
        },
        "right_eye_lower_right_quarter": {
          "y": 108,
          "x": 178
        },
        "mouth_upper_lip_right_contour2": {
          "y": 150,
          "x": 160
        },
        "right_eyebrow_lower_right_quarter": {
          "y": 92,
          "x": 187
        },
        "left_eye_left_corner": {
          "y": 106,
          "x": 108
        },
        "mouth_right_corner": {
          "y": 155,
          "x": 169
        },
        "mouth_upper_lip_right_contour3": {
          "y": 153,
          "x": 156
        },
        "right_eye_lower_left_quarter": {
          "y": 109,
          "x": 166
        },
        "left_eyebrow_right_corner": {
          "y": 91,
          "x": 133
        },
        "left_eyebrow_lower_right_quarter": {
          "y": 91,
          "x": 124
        },
        "right_eye_center": {
          "y": 106,
          "x": 172
        },
        "nose_left": {
          "y": 134,
          "x": 123
        },
        "mouth_lower_lip_left_contour1": {
          "y": 165,
          "x": 129
        },
        "left_eye_upper_right_quarter": {
          "y": 104,
          "x": 124
        },
        "right_eyebrow_lower_middle": {
          "y": 90,
          "x": 177
        },
        "left_eye_top": {
          "y": 102,
          "x": 118
        },
        "left_eye_center": {
          "y": 107,
          "x": 118
        },
        "contour_left8": {
          "y": 189,
          "x": 118
        },
        "contour_right9": {
          "y": 199,
          "x": 157
        },
        "right_eye_left_corner": {
          "y": 108,
          "x": 160
        },
        "mouth_lower_lip_bottom": {
          "y": 177,
          "x": 143
        },
        "left_eyebrow_upper_left_quarter": {
          "y": 85,
          "x": 103
        },
        "left_eye_pupil": {
          "y": 106,
          "x": 120
        },
        "right_eyebrow_upper_left_quarter": {
          "y": 85,
          "x": 164
        },
        "contour_right8": {
          "y": 191,
          "x": 169
        },
        "right_eyebrow_right_corner": {
          "y": 96,
          "x": 197
        },
        "right_eye_upper_left_quarter": {
          "y": 104,
          "x": 165
        },
        "left_eyebrow_upper_middle": {
          "y": 83,
          "x": 114
        },
        "right_eyebrow_upper_right_quarter": {
          "y": 87,
          "x": 189
        },
        "nose_contour_left1": {
          "y": 107,
          "x": 134
        },
        "nose_contour_left2": {
          "y": 125,
          "x": 128
        },
        "mouth_upper_lip_right_contour1": {
          "y": 148,
          "x": 148
        },
        "nose_contour_right1": {
          "y": 107,
          "x": 153
        },
        "nose_contour_right2": {
          "y": 126,
          "x": 157
        },
        "mouth_lower_lip_left_contour2": {
          "y": 166,
          "x": 123
        },
        "contour_right6": {
          "y": 172,
          "x": 188
        },
        "nose_contour_right3": {
          "y": 138,
          "x": 153
        },
        "nose_contour_left3": {
          "y": 138,
          "x": 133
        },
        "left_eye_right_corner": {
          "y": 108,
          "x": 129
        },
        "left_eyebrow_upper_right_quarter": {
          "y": 84,
          "x": 125
        },
        "right_eye_upper_right_quarter": {
          "y": 103,
          "x": 178
        },
        "mouth_upper_lip_bottom": {
          "y": 154,
          "x": 143
        }
      },
      "attributes": {
        "emotion": {
          "sadness": 0.135,
          "neutral": 0.002,
          "disgust": 0.002,
          "anger": 0.002,
          "surprise": 0.002,
          "fear": 0.008,
          "happiness": 99.849
        },
        "gender": {
          "value": "Male"
        },
        "age": {
          "value": 25
        },
        "eyestatus": {
          "left_eye_status": {
            "normal_glass_eye_open": 99.436,
            "no_glass_eye_close": 0,
            "occlusion": 0,
            "no_glass_eye_open": 0.564,
            "normal_glass_eye_close": 0,
            "dark_glasses": 0
          },
          "right_eye_status": {
            "normal_glass_eye_open": 98.337,
            "no_glass_eye_close": 0,
            "occlusion": 0.045,
            "no_glass_eye_open": 1.464,
            "normal_glass_eye_close": 0,
            "dark_glasses": 0.154
          }
        },
        "glass": {
          "value": "Normal"
        },
        "headpose": {
          "yaw_angle": 3.0910661,
          "pitch_angle": 5.109354,
          "roll_angle": 1.5614953
        },
        "blur": {
          "blurness": {
            "threshold": 50,
            "value": 0.36
          },
          "motionblur": {
            "threshold": 50,
            "value": 0.36
          },
          "gaussianblur": {
            "threshold": 50,
            "value": 0.36
          }
        },
        "smile": {
          "threshold": 50,
          "value": 100
        },
        "facequality": {
          "threshold": 70.1,
          "value": 91.97
        },
        "ethnicity": {
          "value": "ASIAN"
        }
      },
      "face_rectangle": {
        "width": 119,
        "top": 82,
        "left": 87,
        "height": 119
      },
      "face_token": "f1eb48a5dee2b590569d5d8e3ce39e0b"
    }
  ]
}

console.log(distance(jsonT.faces[0], 720, jsonS.faces[0], 300))
