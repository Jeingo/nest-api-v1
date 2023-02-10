import { LikeStatus } from '../../global-types/global.types';

export type LikesInfoType = {
  likesCount: number;
  dislikesCount: number;
};

export function getUpdatedLike(
  likesInfo: LikesInfoType,
  lastStatus: LikeStatus,
  newStatus: LikeStatus
) {
  if (newStatus === LikeStatus.None && lastStatus === LikeStatus.Like) {
    return { ...likesInfo, likesCount: --likesInfo.likesCount };
  }
  if (newStatus === LikeStatus.None && lastStatus === LikeStatus.DisLike) {
    return { ...likesInfo, dislikesCount: --likesInfo.dislikesCount };
  }
  if (newStatus === LikeStatus.Like && lastStatus === LikeStatus.None) {
    return { ...likesInfo, likesCount: ++likesInfo.likesCount };
  }
  if (newStatus === LikeStatus.Like && lastStatus === LikeStatus.DisLike) {
    return {
      ...likesInfo,
      likesCount: ++likesInfo.likesCount,
      dislikesCount: --likesInfo.dislikesCount
    };
  }
  if (newStatus === LikeStatus.DisLike && lastStatus === LikeStatus.None) {
    return { ...likesInfo, dislikesCount: ++likesInfo.dislikesCount };
  }
  if (newStatus === LikeStatus.DisLike && lastStatus === LikeStatus.Like) {
    return {
      ...likesInfo,
      likesCount: --likesInfo.likesCount,
      dislikesCount: ++likesInfo.dislikesCount
    };
  }
  return likesInfo;
}
