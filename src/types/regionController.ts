export interface IQueryConditions {
  coordinates?: {
    $nearSphere: {
      $geometry: {
        type: string;
        coordinates: any;
      };
      $maxDistance: number;
    };
  };
  user?: string;
}
