/*
 * From MihaiValentin/lunr-languages.
 * Last update from 2017/04/16 - 19af41fb9bd644d9081ad274f96f700b21464290
 */
export function generateTrimmer(wordCharacters: string) {
  const regex = new RegExp(`^[^${wordCharacters}]+|[^${wordCharacters}]+$`, "g");
  return (token: string) => token.replace(regex, "");
}

export function generateStopWordFilter(stopWords: string[]) {
  const words = new Set(stopWords);
  return (token: string) => words.has(token) ? "" : token;
}

export class Among {
  s_size: number;
  s: number[];
  substring_i: number;
  result: number;
  method: any;

  constructor(s: string, substring_i: number, result: number, method?: any) {
    if ((!s && s !== "") || (!substring_i && (substring_i !== 0)) || !result) {
      throw ("Bad Among initialisation: s:" + s + ", substring_i: " + substring_i + ", result: " + result);
    }

    this.s_size = s.length;
    this.substring_i = substring_i;
    this.result = result;
    this.method = method;

    // Split string into a numeric character array.
    this.s = new Array(this.s_size);
    for (let i = 0; i < this.s_size; i++) {
      this.s[i] = +s.charCodeAt(i);
    }
  }
}

export class SnowballProgram {
  current: string;
  bra: number;
  ket: number;
  limit: number;
  cursor: number;
  limit_backward: number;

  constructor() {
    this.current = null;
    this.bra = 0;
    this.ket = 0;
    this.limit = 0;
    this.cursor = 0;
    this.limit_backward = 0;
  }

  setCurrent(word: string) {
    this.current = word;
    this.cursor = 0;
    this.limit = word.length;
    this.limit_backward = 0;
    this.bra = this.cursor;
    this.ket = this.limit;
  }

  getCurrent() {
    let result = this.current;
    this.current = null;
    return result;
  }

  in_grouping(s: number[], min: number, max: number) {
    if (this.cursor < this.limit) {
      let ch = this.current.charCodeAt(this.cursor);
      if (ch <= max && ch >= min) {
        ch -= min;
        if (s[ch >> 3] & (0X1 << (ch & 0X7))) {
          this.cursor++;
          return true;
        }
      }
    }
    return false;
  }

  in_grouping_b(s: number[], min: number, max: number) {
    if (this.cursor > this.limit_backward) {
      let ch = this.current.charCodeAt(this.cursor - 1);
      if (ch <= max && ch >= min) {
        ch -= min;
        if (s[ch >> 3] & (0X1 << (ch & 0X7))) {
          this.cursor--;
          return true;
        }
      }
    }
    return false;
  }

  out_grouping(s: number[], min: number, max: number) {
    if (this.cursor < this.limit) {
      let ch = this.current.charCodeAt(this.cursor);
      if (ch > max || ch < min) {
        this.cursor++;
        return true;
      }
      ch -= min;
      if (!(s[ch >> 3] & (0X1 << (ch & 0X7)))) {
        this.cursor++;
        return true;
      }
    }
    return false;
  }

  out_grouping_b(s: number[], min: number, max: number) {
    if (this.cursor > this.limit_backward) {
      let ch = this.current.charCodeAt(this.cursor - 1);
      if (ch > max || ch < min) {
        this.cursor--;
        return true;
      }
      ch -= min;
      if (!(s[ch >> 3] & (0X1 << (ch & 0X7)))) {
        this.cursor--;
        return true;
      }
    }
    return false;
  }

  eq_s(s_size: number, s: string) {
    if (this.limit - this.cursor < s_size) {
      return false;
    }
    for (let i = 0; i < s_size; i++) {
      if (this.current.charCodeAt(this.cursor + i) !== s.charCodeAt(i)) {
        return false;
      }
    }
    this.cursor += s_size;
    return true;
  }

  eq_s_b(s_size: number, s: string) {
    if (this.cursor - this.limit_backward < s_size) {
      return false;
    }
    for (let i = 0; i < s_size; i++) {
      if (this.current.charCodeAt(this.cursor - s_size + i) !== s.charCodeAt(i)) {
        return false;
      }
    }
    this.cursor -= s_size;
    return true;
  }

  find_among(v: Among[], v_size: number) {
    let i = 0;
    let j = v_size;
    let c = this.cursor;
    let l = this.limit;
    let common_i = 0;
    let common_j = 0;
    let first_key_inspected = false;
    while (true) {
      let k = i + ((j - i) >> 1);
      let diff = 0;
      let common = common_i < common_j ? common_i : common_j;

      let w = v[k];
      for (let i2 = common; i2 < w.s_size; i2++) {
        if (c + common === l) {
          diff = -1;
          break;
        }
        diff = this.current.charCodeAt(c + common) - w.s[i2];
        if (diff) {
          break;
        }
        common++;
      }
      if (diff < 0) {
        j = k;
        common_j = common;
      } else {
        i = k;
        common_i = common;
      }
      if (j - i <= 1) {
        if (i > 0 || j === i || first_key_inspected) {
          break;
        }
        first_key_inspected = true;
      }
    }
    while (true) {
      let w = v[i];
      if (common_i >= w.s_size) {
        this.cursor = c + w.s_size;
        if (!w.method) {
          return w.result;
        }
        let res = w.method();
        this.cursor = c + w.s_size;
        if (res) {
          return w.result;
        }
      }
      i = w.substring_i;
      if (i < 0) {
        return 0;
      }
    }
  }

  find_among_b(v: Among[], v_size: number) {
    let i = 0;
    let j = v_size;
    let c = this.cursor;
    let lb = this.limit_backward;
    let common_i = 0;
    let common_j = 0;
    let first_key_inspected = false;
    while (true) {
      let k = i + ((j - i) >> 1);
      let diff = 0;

      let common = common_i < common_j
        ? common_i
        : common_j;

      let w = v[k];
      for (let i2 = w.s_size - 1 - common; i2 >= 0; i2--) {
        if (c - common === lb) {
          diff = -1;
          break;
        }
        diff = this.current.charCodeAt(c - 1 - common) - w.s[i2];
        if (diff)
          break;
        common++;
      }
      if (diff < 0) {
        j = k;
        common_j = common;
      } else {
        i = k;
        common_i = common;
      }
      if (j - i <= 1) {
        if (i > 0 || j === i || first_key_inspected)
          break;
        first_key_inspected = true;
      }
    }
    while (true) {
      let w = v[i];
      if (common_i >= w.s_size) {
        this.cursor = c - w.s_size;
        if (!w.method)
          return w.result;
        let res = w.method();
        this.cursor = c - w.s_size;
        if (res)
          return w.result;
      }
      i = w.substring_i;
      if (i < 0)
        return 0;
    }
  }

  replace_s(c_bra: number, c_ket: number, s: string) {
    let adjustment = s.length - (c_ket - c_bra);

    let left = this.current
      .substring(0, c_bra);

    let right = this.current.substring(c_ket);
    this.current = left + s + right;
    this.limit += adjustment;
    if (this.cursor >= c_ket)
      this.cursor += adjustment;
    else if (this.cursor > c_bra)
      this.cursor = c_bra;
    return adjustment;
  }

  slice_check() {
    if (this.bra < 0 || this.bra > this.ket || this.ket > this.limit
      || this.limit > this.current.length) {
      throw ("faulty slice operation");
    }
  }

  slice_from(s: string) {
    this.slice_check();
    this.replace_s(this.bra, this.ket, s);
  }

  slice_del() {
    this.slice_from("");
  }

  insert(c_bra: number, c_ket: number, s: string) {
    let adjustment = this.replace_s(c_bra, c_ket, s);
    if (c_bra <= this.bra)
      this.bra += adjustment;
    if (c_bra <= this.ket)
      this.ket += adjustment;
  }

  slice_to() {
    this.slice_check();
    return this.current.substring(this.bra, this.ket);
  }

  eq_v_b(s: string) {
    return this.eq_s_b(s.length, s);
  }
}
