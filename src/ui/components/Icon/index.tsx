import type { DetailedHTMLProps, FC, HTMLAttributes } from "react";

import * as Icons from "../../assets/icons";
import { cx } from "../../utils/cx";

import type * as T from "./types";

export interface IconProps
  extends DetailedHTMLProps<HTMLAttributes<HTMLElement>, HTMLElement> {
  iconKey?: T.IconKeyVariant;
  size?: T.IconSize;
}

const iconMap: Record<T.IconKeyVariant, FC<{ variant: T.IconVariant }>> = {
  hourglass: Icons.Hourglass,
  checkCircleFilled: Icons.CheckCircleFilled,
  playCircleFilled: Icons.PlayCircleFilled,
  infoCircleFilled: Icons.InfoCircleFilled,
  ethLogo: Icons.EthLogo,
  babylonLogo: Icons.BabylonLogo,
  instagram: Icons.Instagram,
  telegram: Icons.Telegram,
  linkedIn: Icons.LinkedIn,
  twitter: Icons.Twitter,
  youTube: Icons.YouTube,
  reddit: Icons.Reddit,
  medium: Icons.Medium,
  rarible: Icons.Rarible,
  x2y2: Icons.X2Y2,
  openSea: Icons.OpenSea,
  looksRare: Icons.LooksRare,
  arrowDown: Icons.ArrowDown,
  arrowLeft: Icons.ArrowLeft,
  arrowRight: Icons.ArrowRight,
  arrowUpRight: Icons.ArrowUpRight,
  arrowUp: Icons.ArrowUp,
  banknote: Icons.Banknote,
  certificate: Icons.Certificate,
  checkCircle: Icons.CheckCircle,
  checkVerified: Icons.CheckVerified,
  check: Icons.Check,
  chevronDown: Icons.ChevronDown,
  chevronLeft: Icons.ChevronLeft,
  chevronRight: Icons.ChevronRight,
  chevronSelector: Icons.ChevronSelector,
  chevronUp: Icons.ChevronUp,
  copy: Icons.Copy,
  cube: Icons.Cube,
  cubeOutline: Icons.CubeOutline,
  dataflow: Icons.Dataflow,
  download: Icons.Download,
  downloadAlt: Icons.DownloadAlt,
  fingerprint: Icons.Fingerprint,
  globe: Icons.Globe,
  infoCircle: Icons.InfoCircle,
  lineChartUp: Icons.LineChartUp,
  list: Icons.List,
  markerPin: Icons.MarkerPin,
  minus: Icons.Minus,
  monitor: Icons.Monitor,
  moon: Icons.Moon,
  plus: Icons.Plus,
  presentationChart: Icons.PresentationChart,
  settings: Icons.Settings,
  share: Icons.Share,
  star: Icons.Star,
  sun: Icons.Sun,
  users: Icons.Users,
  wallet: Icons.Wallet,
  menu: Icons.Menu,
  close: Icons.Close,
  layout: Icons.Layout,
  shield: Icons.Shield,
  sale: Icons.Sale,
  speedometer: Icons.Speedometer,
  fileCheck: Icons.FileCheck,
  alert: Icons.Alert,
  bank: Icons.Bank,
  dataflowAlt: Icons.DataflowAlt,
  announcement: Icons.Announcement,
  flag: Icons.Flag,
  hand: Icons.Hand,
  laptop: Icons.Laptop,
  number1: Icons.Number1,
  number2: Icons.Number2,
  number3: Icons.Number3,
  tool: Icons.Tool,
  loading: Icons.Loading,
  alertFilled: Icons.AlertFilled,
  heroDashboard: Icons.HeroDashboard,
  heroFee: Icons.HeroFee,
  heroGrade: Icons.HeroGrade,
  heroRewards: Icons.HeroRewards,
  dots: Icons.Dots,
  connect: Icons.Connect,
  lightning: Icons.Lightning,
  coins: Icons.Coins,
  eigenLayerLogo: Icons.EigenLayerLogo,
  doubleChevron: Icons.DoubleChevron,
  lightningCircle: Icons.LightningCircle,
  search: Icons.Search,
  exit: Icons.Exit,
  keyboard: Icons.Keyboard,
  warning: Icons.Warning,
  filter: Icons.Filter,
  expand: Icons.Expand,
  expandSquare: Icons.ExpandSquare,
  shrinkSquare: Icons.ShrinkSquare,
  roundCheck: Icons.RoundCheck,
  roundEtherscan: Icons.RoundEtherscan,
  roundHelp: Icons.RoundHelp,
  roundInfo: Icons.RoundInfo,
  roundLink: Icons.RoundLink,
  roundOpensea: Icons.RoundOpensea,
  roundTwitter: Icons.RoundTwitter,
  shop: Icons.Shop,
  save: Icons.Save,
  edit: Icons.Edit,
  live: Icons.Live,
  expandBanner: Icons.ExpandBanner,
  voltage: Icons.Voltage,
  key: Icons.Key,
  password: Icons.Password,
  fileProtected: Icons.FileProtected,
  fileFilled: Icons.FileFilled,
  camera: Icons.Camera,
};

export const Icon = ({
  iconKey,
  size = 20,
  className,
  style,
  ...props
}: IconProps) => {
  const classNames = cx(
    "inline-block align-middle text-center [&>svg]:text-inherit [fill:currentColor]",
    `icon icon--${iconKey}`,
    sizes[size],
    className,
  );
  const iconSizeVariant = size < 40 ? 24 : 40;

  if (!iconKey) return <></>;

  const IconComponent = iconMap[iconKey];
  return (
    <span className={classNames} style={style} aria-hidden {...props}>
      <IconComponent variant={iconSizeVariant} />
    </span>
  );
};

const sizes: Record<T.IconSize, string> = {
  6: "w-1.5",
  8: "w-2",
  10: "size-2.5",
  12: "size-3",
  14: "size-3.5",
  16: "size-4",
  18: "size-[18px]",
  20: "size-5",
  22: "size-[22px]",
  24: "size-5 flounder:size-6",
  28: "size-7",
  32: "size-8",
  40: "size-9",
  48: "size-12",
};
