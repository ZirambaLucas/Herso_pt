export interface ClienteCompra {
  CustomerID: number;
  NombreCliente: string;
  UltimaCompra: string;
  TotalOrdenes: number;
  MontoTotal: number;
  MontoPromedio: number;
  Clasificacion: 'Bronze' | 'Silver' | 'Gold';
}
