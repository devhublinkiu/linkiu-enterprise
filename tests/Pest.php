<?php

use Tests\TestCase;

/*
 * Configuración de Pest. Los tests PHPUnit existentes (Breeze) siguen funcionando;
 * Pest los ejecuta igual. Los tests de Feature usan Tests\TestCase.
 */

pest()->extend(TestCase::class)->in('Feature');
