/**
 * Entry: bootstrap is loaded async so Module Federation shared scope
 * is ready before React and other shared modules are consumed (standalone run).
 */
import('./bootstrap');
