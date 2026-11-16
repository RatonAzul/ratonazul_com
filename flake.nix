{
  description = "ratonazul_com development environment";
  inputs.nixpkgs.url = "github:NixOS/nixpkgs/f4a03c008967841f2a0b3cb7c436fc6fc31671f6";
  outputs = { nixpkgs, ... }:
    let
      systems = [ "x86_64-linux" "aarch64-linux" ];
    in {
      devShells = nixpkgs.lib.genAttrs systems (system:
        let
          pkgs = import nixpkgs { inherit system; };
          nodejs = pkgs.nodejs_22;
        in {
          default = pkgs.mkShell {
            packages = [
              nodejs
              (pkgs.pnpm_10.override { nodejs-slim = nodejs; })
              pkgs.docker-compose
              pkgs.postgresql_16
              pkgs.git
            ];
          };
        });
    };
}
