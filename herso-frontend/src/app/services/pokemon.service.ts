import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';

export interface PokemonInfo {
  id: number;
  nombre: string;
  sprite: string;
  tipos: string[];
}

@Injectable({ providedIn: 'root' })
export class PokemonService {
  private readonly base = 'https://pokeapi.co/api/v2';

  constructor(private http: HttpClient) {}

  getPokemon(id: number): Observable<PokemonInfo> {
    return this.http.get<any>(`${this.base}/pokemon/${id}`).pipe(
      map(p => ({
        id: p.id,
        nombre: p.name,
        sprite: p.sprites.front_default,
        tipos: (p.types as any[]).map(t => t.type.name as string),
      }))
    );
  }

  spriteUrl(id: number): string {
    return `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${id}.png`;
  }

  artworkUrl(id: number): string {
    return `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/home/${id}.png`;
  }

  listForTier(tier: string): Observable<{id: number; nombre: string}[]> {
    const rangos: Record<string, {limit: number; offset: number}> = {
      Bronze: { limit: 151, offset: 0   },
      Silver: { limit: 235, offset: 151 },
      Gold:   { limit: 263, offset: 386 },
    };
    const { limit, offset } = rangos[tier] ?? rangos['Bronze'];
    return this.http.get<any>(`${this.base}/pokemon?limit=${limit}&offset=${offset}`).pipe(
      map(res => (res.results as any[]).map((p: any) => ({
        id:     Number(p.url.split('/').filter(Boolean).pop()),
        nombre: p.name as string,
      })))
    );
  }

  idForClient(customerId: number, tier: string): number {
    if (tier === 'Gold')   return (customerId % 263) + 387;
    if (tier === 'Silver') return (customerId % 235) + 152;
    return (customerId % 151) + 1;
  }

  randomIdForTier(tier: string): number {
    if (tier === 'Gold')   return this.random(387, 649);
    if (tier === 'Silver') return this.random(152, 386);
    return this.random(1, 151);
  }

  private random(min: number, max: number): number {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }
}
