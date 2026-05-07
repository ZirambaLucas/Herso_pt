export interface ClienteSeguimiento {
  Id: number;
  CustomerID: number;
  Alias: string | null;
  Estatus: string;
  Observaciones: string | null;
  PokemonId: number | null;
  PokemonNombre: string | null;
  IsDeleted: boolean;
  created_at: string;
  updated_at: string;
}
