import {Long} from "./Long";
import {ParametricDescription} from "./ParametricDescription";

// 1 vectors; 3 states per vector; array length = 3
const toStates0 = /*2 bits per value */ [
  new Long(0x23)
];
const offsetIncrs0 = /*1 bits per value */ [
  new Long(0x0)
];

// 2 vectors; 5 states per vector; array length = 10
const toStates1 = /*3 bits per value */ [
  new Long(0x13688b44)
];
const offsetIncrs1 = /*1 bits per value */ [
  new Long(0x3e0)
];

// 4 vectors; 13 states per vector; array length = 52
const toStates2 = /*4 bits per value */ [
  new Long(0x5200b504, 0x60dbb0b0), new Long(0x27062227, 0x52332176), new Long(0x14323235, 0x23555432), new Long(0x4354)
];
const offsetIncrs2 = /*2 bits per value */ [
  new Long(0x00002000, 0x555080a8), new Long(0x55555555, 0x55)
];

// 8 vectors; 28 states per vector; array length = 224
const toStates3 = /*5 bits per value */ [
  new Long(0x40059404, 0xe701c029), new Long(0x00a50000, 0xa0101620), new Long(0xa1416288, 0xb02c8c40), new Long(0x310858c0, 0xa821032),
  new Long(0x0d28b201, 0x31442398), new Long(0x847788e0, 0x5281e528), new Long(0x08c2280e, 0xa23980d3), new Long(0xa962278c, 0x1e3294b1),
  new Long(0x2288e528, 0x8c41309e), new Long(0x021aca21, 0x11444409), new Long(0x86b1086b, 0x11a46248), new Long(0x1d6240c4, 0x2a625894),
  new Long(0x489074ad, 0x5024a50b), new Long(0x520c411a, 0x14821aca), new Long(0x0b594a44, 0x5888b589), new Long(0xc411a465, 0x941d6520),
  new Long(0xad6a62d4, 0x8b589075), new Long(0x1a5055a4)
];
const offsetIncrs3 = /*2 bits per value */ [
  new Long(0x00002000, 0x30c302), new Long(0xc3fc333c, 0x2a0030f3), new Long(0x8282a820, 0x233a0032), new Long(0x32b283a8, 0x55555555),
  new Long(0x55555555, 0x55555555), new Long(0x55555555, 0x55555555), new Long(0x55555555, 0x55555555)
];

// 16 vectors; 45 states per vector; array length = 720
const toStates4 = /*6 bits per value */ [
  new Long(0x002c5004, 0x3801450), new Long(0x00000e38, 0xc500014b), new Long(0x51401402, 0x514), new Long(0x0),
  new Long(0x14010000, 0x518000b), new Long(0x28e20230, 0x9f1c208), new Long(0x830a70c2, 0x219f0df0), new Long(0x08208200, 0x82000082),
  new Long(0x60800800, 0x8050501), new Long(0x02602643, 0x30820986), new Long(0x50508064, 0x45640142), new Long(0x20000831, 0x8500514),
  new Long(0x85002082, 0x41405820), new Long(0x0990c201, 0x45618098), new Long(0x50a01051, 0x8316d0c), new Long(0x050df0e0, 0x21451420),
  new Long(0x14508214, 0xd142140), new Long(0x50821c60, 0x3c21c018), new Long(0xcb142087, 0x1cb1403), new Long(0x1851822c, 0x80082145),
  new Long(0x20800020, 0x200208), new Long(0x87180345, 0xd0061820), new Long(0x24976b09, 0xcb0a81cb), new Long(0x624709d1, 0x8b1a60e),
  new Long(0x82249089, 0x2490820), new Long(0x00d2c024, 0xc31421c6), new Long(0x15454423, 0x3c314515), new Long(0xc21cb140, 0x31853c22),
  new Long(0x2c208214, 0x4514500b), new Long(0x508b0051, 0x8718034), new Long(0x5108f0c5, 0xb2cb4551), new Long(0x1cb0a810, 0xe824715d),
  new Long(0x908b0e60, 0x1422cb14), new Long(0xc02cb145, 0x30812c22), new Long(0x0cb1420c, 0x84202202), new Long(0x20ce0850, 0x5c20ce08),
  new Long(0x8b0d70c2, 0x20820820), new Long(0x14214208, 0x42085082), new Long(0x50830c20, 0x9208340), new Long(0x13653592, 0xc6134dc6),
  new Long(0x6dc4db4d, 0xd309341c), new Long(0x54d34d34, 0x6424d908), new Long(0x030814c2, 0x92072c22), new Long(0x24a30930, 0x4220724b),
  new Long(0x25c920e2, 0x2470d720), new Long(0x975c9082, 0x92c92d70), new Long(0x04924e08, 0xcb0880c2), new Long(0xc24c2481, 0x45739728),
  new Long(0xda6174da, 0xc6da4db5), new Long(0x5d30971d, 0x4b5d35d7), new Long(0x93825ce2, 0x1030815c), new Long(0x020cb145, 0x51442051),
  new Long(0x2c220e2c, 0xc538210e), new Long(0x52cb0d70, 0x8514214), new Long(0x85145142, 0x204b0850), new Long(0x4051440c, 0x92156083),
  new Long(0xa60e6595, 0x4d660e4d), new Long(0x1c6dc658, 0x94d914e4), new Long(0x1454d365, 0x82642659), new Long(0x51030813, 0x2892072c),
  new Long(0xcb2ca30b, 0xe2c22072), new Long(0x20538910, 0x452c70d7), new Long(0x708e3891, 0x8b2cb2d), new Long(0xc204b24e, 0x81cb1440),
  new Long(0x28c2ca24, 0xda44e38e), new Long(0x85d660e4, 0x1dc6da65), new Long(0x8e5d914e, 0xe2cb5d33), new Long(0x38938238)
];
const offsetIncrs4 = /*3 bits per value */ [
  new Long(0x00080000, 0x30020000), new Long(0x20c060), new Long(0x04000000, 0x81490000), new Long(0x10824824, 0x40249241),
  new Long(0x60002082, 0xdb6030c3), new Long(0x301b0d80, 0x6c36c06c), new Long(0x000db0db, 0xb01861b0), new Long(0x9188e06d, 0x1b703620),
  new Long(0x06d86db7, 0x8009200), new Long(0x02402490, 0x4920c24), new Long(0x08249009, 0x490002), new Long(0x28124804, 0x49081281),
  new Long(0x124a44a2, 0x34800104), new Long(0x0d24020c, 0xc3093090), new Long(0x24c24d24, 0x40009a09), new Long(0x9201061a, 0x4984a06),
  new Long(0x71269262, 0x494d0492), new Long(0x92492492, 0x24924924), new Long(0x49249249, 0x92492492), new Long(0x24924924, 0x49249249),
  new Long(0x92492492, 0x24924924), new Long(0x49249249, 0x92492492), new Long(0x24924924, 0x49249249), new Long(0x92492492, 0x24924924),
  new Long(0x49249249, 0x92492492), new Long(0x24924924, 0x49249249), new Long(0x92492492, 0x24924924), new Long(0x49249249, 0x92492492),
  new Long(0x24924924, 0x49249249), new Long(0x92492492, 0x24924924), new Long(0x49249249, 0x92492492), new Long(0x24924924, 0x49249249),
  new Long(0x92492492, 0x24924924), new Long(0x49249249, 0x2492)
];

// 32 vectors; 45 states per vector; array length = 1440
const toStates5 = /*6 bits per value */ [
  new Long(0x002c5004, 0x3801450), new Long(0x00000e38, 0xc500014b), new Long(0x51401402, 0x514), new Long(0x0),
  new Long(0x14010000, 0x514000b), new Long(0x038e00e0, 0x550000), new Long(0x0600b180, 0x26451850), new Long(0x08208208, 0x82082082),
  new Long(0x40820820, 0x2c500), new Long(0x808c0146, 0x70820a38), new Long(0x9c30827c, 0xc37c20c2), new Long(0x20800867, 0x208208),
  new Long(0x02002080, 0xb1401020), new Long(0x00518000, 0x828e2023), new Long(0x209f1c20, 0x830a70c), new Long(0x853df0df, 0x51451450),
  new Long(0x14508214, 0x16142142), new Long(0x30805050, 0x60260264), new Long(0x43082098, 0x25050806), new Long(0x14564014, 0x42000083),
  new Long(0x20850051, 0x8500208), new Long(0x14140582, 0x80990c20), new Long(0x08261809, 0x82019202), new Long(0x90060941, 0x8920519),
  new Long(0xc22cb242, 0x22492492), new Long(0x0162492c, 0x43080505), new Long(0x86026026, 0x80414515), new Long(0xc5b43142, 0x37c38020),
  new Long(0x14508014, 0x42085085), new Long(0x50850051, 0x1414058), new Long(0x980990c2, 0x51456180), new Long(0x0c50a010, 0xe008316d),
  new Long(0x508b21f0, 0x2c52cb2c), new Long(0xc22cb249, 0x600d2c92), new Long(0x1850821c, 0x873c21c0), new Long(0x03cb1420, 0x2c01cb14),
  new Long(0x45185182, 0x20800821), new Long(0x08208000, 0x45002002), new Long(0x20871803, 0x8700614), new Long(0x050821cf, 0x740500f5),
  new Long(0x18609000, 0x934d9646), new Long(0x30824d30, 0x4c24d34d), new Long(0xc600d642, 0x1860821), new Long(0x25dac274, 0xc2a072c9),
  new Long(0x91c27472, 0x2c698398), new Long(0x89242242, 0x92420820), new Long(0x34b00900, 0x82087180), new Long(0xb09d0061, 0x1cb24976),
  new Long(0x9d1cb0a8, 0x60e62470), new Long(0x1574ce3e, 0xd31455d7), new Long(0x25c25d74, 0x1c600d38), new Long(0x423c3142, 0x51515454),
  new Long(0x1403c314, 0xc22c21cb), new Long(0x21431853, 0xb2c208), new Long(0x05145145, 0x34508b0), new Long(0x0c508718, 0x5515108f),
  new Long(0xf2051454, 0x8740500), new Long(0x0618f090, 0xe2534d92), new Long(0x6592c238, 0x49382659), new Long(0x21c600d6, 0x4423c314),
  new Long(0xcb2d1545, 0x72c2a042), new Long(0xa091c574, 0x422c3983), new Long(0x508b2c52, 0xb2c514), new Long(0x8034b08b, 0xf0c50871),
  new Long(0x45515108, 0xa810b2cb), new Long(0x715d1cb0, 0x2260e824), new Long(0x8e2d74ce, 0xe6592c53), new Long(0x38938238, 0x420c3081),
  new Long(0x22020cb1, 0x8508420), new Long(0xce0820ce, 0x70c25c20), new Long(0x08208b0d, 0x42082082), new Long(0x50821421, 0xc204208),
  new Long(0x832c5083, 0x21080880), new Long(0x0838c214, 0xa5083882), new Long(0xa9c39430, 0xaaaaaaaa), new Long(0x9fa9faaa, 0x1aaa7eaa),
  new Long(0x1420c308, 0x824820d0), new Long(0x84d94d64, 0x7184d371), new Long(0x1b7136d3, 0x34c24d07), new Long(0x1534d34d, 0x99093642),
  new Long(0x30c20530, 0x8340508), new Long(0x53592092, 0x34dc6136), new Long(0x4db4dc61, 0xa479c6dc), new Long(0x4924924a, 0x920a9f92),
  new Long(0x8192a82a, 0x72c22030), new Long(0x30930920, 0x724b24a), new Long(0x920e2422, 0xd72025c), new Long(0xc9082247, 0x92d70975),
  new Long(0x24e0892c, 0x880c2049), new Long(0xc2481cb0, 0x2c928c24), new Long(0x89088749, 0x80a52488), new Long(0xaac74394, 0x6a861b2a),
  new Long(0xab27b278, 0x81b2ca6), new Long(0x072c2203, 0xa3093092), new Long(0x6915ce5c, 0xd76985d3), new Long(0x771b6936, 0x5d74c25c),
  new Long(0x892d74d7, 0x724e0973), new Long(0x0880c205, 0x4c2481cb), new Long(0x739728c2, 0x6174da45), new Long(0xda4db5da, 0x4aa175c6),
  new Long(0x86486186, 0x6a869b27), new Long(0x308186ca, 0xcb14510), new Long(0x44205102, 0x220e2c51), new Long(0x38210e2c, 0xcb0d70c5),
  new Long(0x51421452, 0x14514208), new Long(0x4b085085, 0x51440c20), new Long(0x1440832c, 0xcb145108), new Long(0x488b0888, 0x94316208),
  new Long(0x9f7e79c3, 0xfaaa7dfa), new Long(0x7ea7df7d, 0x30819ea), new Long(0x20d01451, 0x65648558), new Long(0x93698399, 0x96135983),
  new Long(0x39071b71, 0xd9653645), new Long(0x96451534, 0x4e09909), new Long(0x051440c2, 0x21560834), new Long(0x60e65959, 0xd660e4da),
  new Long(0xc6dc6584, 0x9207e979), new Long(0xdf924820, 0xa82a8207), new Long(0x103081a6, 0x892072c5), new Long(0xb2ca30b2, 0x2c22072c),
  new Long(0x0538910e, 0x52c70d72), new Long(0x08e38914, 0x8b2cb2d7), new Long(0x204b24e0, 0x1cb1440c), new Long(0x8c2ca248, 0x874b2cb2),
  new Long(0x24488b08, 0x43948162), new Long(0x9b1f7e77, 0x9e786aa6), new Long(0xeca6a9e7, 0x51030819), new Long(0x2892072c, 0x8e38a30b),
  new Long(0x83936913, 0x69961759), new Long(0x4538771b, 0x74ce3976), new Long(0x08e38b2d, 0xc204e24e), new Long(0x81cb1440, 0x28c2ca24),
  new Long(0xda44e38e, 0x85d660e4), new Long(0x75c6da65, 0x698607e9), new Long(0x99e7864a, 0xa6ca6aa6)
];
const offsetIncrs5 = /*3 bits per value */ [
  new Long(0x00080000, 0x30020000), new Long(0x20c060), new Long(0x04000000, 0x1000000), new Long(0x50603018, 0xdb6db6db),
  new Long(0x00002db6, 0xa4800002), new Long(0x41241240, 0x12492088), new Long(0x00104120, 0x40000100), new Long(0x92092052, 0x2492c420),
  new Long(0x096592d9, 0xc30d800), new Long(0xc36036d8, 0xb01b0c06), new Long(0x6c36db0d, 0x186c0003), new Long(0xb01b6c06, 0xad860361),
  new Long(0x5b6dd6dd, 0x360001b7), new Long(0x0db6030c, 0xc412311c), new Long(0xb6e36e06, 0xdb0d), new Long(0xdb01861b, 0x9188e06),
  new Long(0x71b72b62, 0x6dd6db), new Long(0x00800920, 0x40240249), new Long(0x904920c2, 0x20824900), new Long(0x40049000, 0x12012480),
  new Long(0xa4906120, 0x5524ad4a), new Long(0x02480015, 0x40924020), new Long(0x48409409, 0x92522512), new Long(0x24000820, 0x49201001),
  new Long(0x204a04a0, 0x29128924), new Long(0x00055549, 0x900830d2), new Long(0x24c24034, 0x934930c), new Long(0x02682493, 0x4186900),
  new Long(0x61201a48, 0x9a498612), new Long(0x355249d4, 0xc348001), new Long(0x940d2402, 0x24c40930), new Long(0x0924e24d, 0x1a40009a),
  new Long(0x06920106, 0x6204984a), new Long(0x92712692, 0x92494d54), new Long(0x24924924, 0x49249249), new Long(0x92492492, 0x24924924),
  new Long(0x49249249, 0x92492492), new Long(0x24924924, 0x49249249), new Long(0x92492492, 0x24924924), new Long(0x49249249, 0x92492492),
  new Long(0x24924924, 0x49249249), new Long(0x92492492, 0x24924924), new Long(0x49249249, 0x92492492), new Long(0x24924924, 0x49249249),
  new Long(0x92492492, 0x24924924), new Long(0x49249249, 0x92492492), new Long(0x24924924, 0x49249249), new Long(0x92492492, 0x24924924),
  new Long(0x49249249, 0x92492492), new Long(0x24924924, 0x49249249), new Long(0x92492492, 0x24924924), new Long(0x49249249, 0x92492492),
  new Long(0x24924924, 0x49249249), new Long(0x92492492, 0x24924924), new Long(0x49249249, 0x92492492), new Long(0x24924924, 0x49249249),
  new Long(0x92492492, 0x24924924), new Long(0x49249249, 0x92492492), new Long(0x24924924, 0x49249249), new Long(0x92492492, 0x24924924),
  new Long(0x49249249, 0x92492492), new Long(0x24924924, 0x49249249), new Long(0x92492492, 0x24924924), new Long(0x49249249, 0x92492492),
  new Long(0x24924924, 0x49249249), new Long(0x92492492, 0x24924924), new Long(0x49249249, 0x92492492), new Long(0x24924924)
];

// state map
//   0 -> [(0, 0)]
//   1 -> [(0, 2)]
//   2 -> [(0, 1)]
//   3 -> [(0, 1), (1, 1)]
//   4 -> [(0, 2), (1, 2)]
//   5 -> [t(0, 2), (0, 2), (1, 2), (2, 2)]
//   6 -> [(0, 2), (2, 1)]
//   7 -> [(0, 1), (2, 2)]
//   8 -> [(0, 2), (2, 2)]
//   9 -> [(0, 1), (1, 1), (2, 1)]
//   10 -> [(0, 2), (1, 2), (2, 2)]
//   11 -> [(0, 1), (2, 1)]
//   12 -> [t(0, 1), (0, 1), (1, 1), (2, 1)]
//   13 -> [(0, 2), (1, 2), (2, 2), (3, 2)]
//   14 -> [t(0, 2), (0, 2), (1, 2), (2, 2), (3, 2)]
//   15 -> [(0, 2), t(1, 2), (1, 2), (2, 2), (3, 2)]
//   16 -> [(0, 2), (2, 1), (3, 1)]
//   17 -> [(0, 1), t(1, 2), (2, 2), (3, 2)]
//   18 -> [(0, 2), (3, 2)]
//   19 -> [(0, 2), (1, 2), t(1, 2), (2, 2), (3, 2)]
//   20 -> [t(0, 2), (0, 2), (1, 2), (3, 1)]
//   21 -> [(0, 1), (1, 1), (3, 2)]
//   22 -> [(0, 2), (2, 2), (3, 2)]
//   23 -> [(0, 2), (1, 2), (3, 1)]
//   24 -> [(0, 2), (1, 2), (3, 2)]
//   25 -> [(0, 1), (2, 2), (3, 2)]
//   26 -> [(0, 2), (3, 1)]
//   27 -> [(0, 1), (3, 2)]
//   28 -> [(0, 2), (2, 1), (4, 2)]
//   29 -> [(0, 2), t(1, 2), (1, 2), (2, 2), (3, 2), (4, 2)]
//   30 -> [(0, 2), (1, 2), (4, 2)]
//   31 -> [(0, 2), (1, 2), (3, 2), (4, 2)]
//   32 -> [(0, 2), (2, 2), (3, 2), (4, 2)]
//   33 -> [(0, 2), (1, 2), t(2, 2), (2, 2), (3, 2), (4, 2)]
//   34 -> [(0, 2), (1, 2), (2, 2), t(2, 2), (3, 2), (4, 2)]
//   35 -> [(0, 2), (3, 2), (4, 2)]
//   36 -> [(0, 2), t(2, 2), (2, 2), (3, 2), (4, 2)]
//   37 -> [t(0, 2), (0, 2), (1, 2), (2, 2), (4, 2)]
//   38 -> [(0, 2), (1, 2), (2, 2), (4, 2)]
//   39 -> [t(0, 2), (0, 2), (1, 2), (2, 2), (3, 2), (4, 2)]
//   40 -> [(0, 2), (1, 2), (2, 2), (3, 2), (4, 2)]
//   41 -> [(0, 2), (4, 2)]
//   42 -> [t(0, 2), (0, 2), (1, 2), (2, 2), t(2, 2), (3, 2), (4, 2)]
//   43 -> [(0, 2), (2, 2), (4, 2)]
//   44 -> [(0, 2), (1, 2), t(1, 2), (2, 2), (3, 2), (4, 2)]

export class Lev2TParametricDescription extends ParametricDescription {
  constructor(w: number) {
    super(w, 2, [0, 2, 1, 0, 1, 0, -1, 0, 0, -1, 0, -1, -1, -1, -1, -1, -2, -1, -1, -1, -2, -1, -1, -2, -1, -1, -2, -1, -2, -2, -2, -2, -2, -2, -2, -2, -2, -2, -2, -2, -2, -2, -2, -2, -2]);
  }

  transition(absState: number, position: number, vector: number) {
    // null absState should never be passed in
    // assert absState != -1;

    // decode absState -> state, offset
    let state = Math.floor(absState / (this.w + 1));
    let offset = absState % (this.w + 1);
    // assert offset >= 0;

    if (position === this.w) {
      if (state < 3) {
        const loc = vector * 3 + state;
        offset += this.unpack(offsetIncrs0, loc, 1);
        state = this.unpack(toStates0, loc, 2) - 1;
      }
    } else if (position === this.w - 1) {
      if (state < 5) {
        const loc = vector * 5 + state;
        offset += this.unpack(offsetIncrs1, loc, 1);
        state = this.unpack(toStates1, loc, 3) - 1;
      }
    } else if (position === this.w - 2) {
      if (state < 13) {
        const loc = vector * 13 + state;
        offset += this.unpack(offsetIncrs2, loc, 2);
        state = this.unpack(toStates2, loc, 4) - 1;
      }
    } else if (position === this.w - 3) {
      if (state < 28) {
        const loc = vector * 28 + state;
        offset += this.unpack(offsetIncrs3, loc, 2);
        state = this.unpack(toStates3, loc, 5) - 1;
      }
    } else if (position === this.w - 4) {
      if (state < 45) {
        const loc = vector * 45 + state;
        offset += this.unpack(offsetIncrs4, loc, 3);
        state = this.unpack(toStates4, loc, 6) - 1;
      }
    } else {
      if (state < 45) {
        const loc = vector * 45 + state;
        offset += this.unpack(offsetIncrs5, loc, 3);
        state = this.unpack(toStates5, loc, 6) - 1;
      }
    }

    if (state === -1) {
      // null state
      return -1;
    } else {
      // translate back to abs
      return state * (this.w + 1) + offset;
    }
  }
}
