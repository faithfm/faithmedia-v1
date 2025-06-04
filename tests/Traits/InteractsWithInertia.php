<?php

namespace Tests\Traits;

use Illuminate\Testing\TestResponse;
use PHPUnit\Framework\Assert;

trait InteractsWithInertia
{
    /**
     * Assert that the response is an Inertia response and passes the given validation callback.
     *
     * @param TestResponse $response
     * @param callable $callback
     * @return void
     */
    public function assertInertia(TestResponse $response, callable $callback): void
    {
        $response->assertPropCount('page', 1);
        $page = $response->viewData('page');
        
        Assert::assertIsArray($page);
        Assert::assertArrayHasKey('component', $page);
        Assert::assertArrayHasKey('props', $page);
        Assert::assertArrayHasKey('url', $page);
        Assert::assertArrayHasKey('version', $page);
        
        $callback($page);
    }

    /**
     * Assert that the Inertia response has a specific component.
     *
     * @param TestResponse $response
     * @param string $component
     * @return void
     */
    public function assertInertiaComponent(TestResponse $response, string $component): void
    {
        $this->assertInertia($response, function ($page) use ($component) {
            Assert::assertEquals($component, $page['component']);
        });
    }

    /**
     * Assert that the Inertia response has a specific prop.
     *
     * @param TestResponse $response
     * @param string $prop
     * @param mixed $value
     * @return void
     */
    public function assertInertiaProp(TestResponse $response, string $prop, $value = null): void
    {
        $this->assertInertia($response, function ($page) use ($prop, $value) {
            Assert::assertArrayHasKey($prop, $page['props']);
            
            if ($value !== null) {
                Assert::assertEquals($value, $page['props'][$prop]);
            }
        });
    }
}
