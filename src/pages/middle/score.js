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


function cut_part(vec_t, vec_s) {
  const rect_t = get_rect(vec_t);
  const rect_s = get_rect(vec_s);
  return [get_position(vec_t, rect_t), get_position(vec_s, rect_s)];
}

function landmark_distance(lmk_s, width_s, lmk_t, width_t, landmark) {
  let [vec_t, vec_s] = resize(lmk_s, width_s, lmk_t, width_t, landmark);
  [vec_t, vec_s] = cut_part(vec_t, vec_s);
  let distance = o_sim(vec_t, vec_s);
  return distance;
}

function eyebrow_center(vector) {
  let result = [];
  result.push(vector[0]);
  result.push([(vector[1][0] + vector[2][0]) * 0.5, (vector[1][1] + vector[2][1]) * 0.5]);
  result.push([(vector[3][0] + vector[4][0]) * 0.5, (vector[3][1] + vector[4][1]) * 0.5]);
  result.push([(vector[5][0] + vector[6][0]) * 0.5, (vector[5][1] + vector[6][1]) * 0.5]);
  result.push(vector[7]);
  return result;
}

function eyebrow_distance(lmk_s, width_s, lmk_t, width_t, landmark) {
  let [vec_t, vec_s] = resize(lmk_s, width_s, lmk_t, width_t, landmark);
  vec_t = eyebrow_center(vec_t);
  vec_s = eyebrow_center(vec_s);
  [vec_t, vec_s] = cut_part(vec_t, vec_s);
  let distance = o_sim(vec_t, vec_s);
  return distance;
}

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

export {
  distance,
  classify
}
