// src/config/dto/create-config.dto.ts
export class GpsLocationDto {
  lat: number;
  lng: number;
  radius: number = 50;
}

export class CreateConfigDto {
  loc1?: GpsLocationDto;
  loc2?: GpsLocationDto;
  lat?: number;
  lng?: number;
  radius?: number;
}
