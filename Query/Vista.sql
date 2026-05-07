CREATE VIEW vw_ClientesCompras AS
SELECT
    c.CustomerID,
    p.FirstName + ' ' + p.LastName          AS NombreCliente,
    MAX(soh.OrderDate)                      AS UltimaCompra,
    COUNT(soh.SalesOrderID)                 AS TotalOrdenes,
    SUM(soh.TotalDue)                       AS MontoTotal,
    AVG(soh.TotalDue)                       AS MontoPromedio
FROM Sales.Customer c
INNER JOIN Person.Person p
    ON c.PersonID = p.BusinessEntityID
INNER JOIN Sales.SalesOrderHeader soh
    ON c.CustomerID = soh.CustomerID
GROUP BY
    c.CustomerID,
    p.FirstName,
    p.LastName

---------------------------------------------------------------------------
CREATE VIEW vw_ClientesCompras AS
SELECT
    c.CustomerID,
    MAX(p.FirstName + ' ' + p.LastName)     AS NombreCliente,
    MAX(soh.OrderDate)                      AS UltimaCompra,
    COUNT(soh.SalesOrderID)                 AS TotalOrdenes,
    SUM(soh.TotalDue)                       AS MontoTotal,
    AVG(soh.TotalDue)                       AS MontoPromedio
FROM Sales.Customer c
INNER JOIN Person.Person p
    ON c.PersonID = p.BusinessEntityID
INNER JOIN Sales.SalesOrderHeader soh
    ON c.CustomerID = soh.CustomerID
GROUP BY
    c.CustomerID