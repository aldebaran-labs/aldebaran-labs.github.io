# aldebaransystems.com

Sitio oficial de **Inversiones Sistema Aldebaran, C.A.** (RIF J-50881454-1), que opera comercialmente como **Aldebaran Labs**.

Publicado con GitHub Pages en el dominio `aldebaransystems.com` (DNS en Cloudflare).

## Estructura

```
├── index.html            Página principal (ES/EN)
├── legal/                Información corporativa y aviso legal
├── privacidad/           Política de privacidad
├── terminos/             Términos de servicio
├── 404.html              Página de error
├── assets/
│   ├── css/site.css      Estilos del sitio
│   ├── js/main.js        Idioma ES/EN, menú móvil, copiar, formulario
│   └── img/              Logo, favicon, imagen para redes (og-image)
├── robots.txt
├── sitemap.xml
├── site.webmanifest
└── CNAME                 Dominio personalizado — no borrar
```

## Notas

- Sitio estático: no requiere build. Cualquier cambio en `main` se publica solo en 1–2 minutos.
- Idioma: el español va en el HTML; las traducciones al inglés están en el bloque `<script id="i18n-en">` al final de cada página. Se puede enlazar directo en inglés con `?lang=en`.
- Identidad: logo original (A cian con estrella ámbar), azul noche `#0A1022`, cian `#4CC3F5`, ámbar `#F5A524`, tipografías Sora + Atkinson Hyperlegible.
- Animaciones: todas respetan la opción del sistema "reducir movimiento" y las de las misiones solo corren cuando están en pantalla.
- El formulario de contacto abre el correo del visitante dirigido a `andres@aldebaransystems.com` (no guarda datos).
- Al cambiar la fecha de una página legal, actualizar también `sitemap.xml`.
